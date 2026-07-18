import crypto from "node:crypto";
import {
  readOAuthState,
  readToken,
  writeDailyMetrics,
  writeOAuthState,
  writeRawSync,
  writeToken,
} from "./storage.js";
import { normalizeOuraDailyMetrics } from "./normalizeOura.js";

const OURA_AUTHORIZE_URL = "https://cloud.ouraring.com/oauth/authorize";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";
const OURA_API_URL = "https://api.ouraring.com/v2";
const DEFAULT_SCOPES = "daily spo2";
let refreshPromise = null;

export function getConfig() {
  return {
    clientId: process.env.OURA_CLIENT_ID,
    clientSecret: process.env.OURA_CLIENT_SECRET,
    redirectUri:
      process.env.OURA_REDIRECT_URI ?? "http://localhost:5173/api/oura/callback",
    scopes: process.env.OURA_SCOPES ?? DEFAULT_SCOPES,
  };
}

export function isConfigured() {
  const config = getConfig();
  return Boolean(config.clientId && config.clientSecret && config.redirectUri);
}

export async function buildAuthorizeUrl() {
  const config = getConfig();
  if (!isConfigured()) {
    throw new Error("Missing Oura OAuth environment variables.");
  }

  const state = crypto.randomBytes(24).toString("hex");
  await writeOAuthState({ state, createdAt: new Date().toISOString() });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes,
    state,
  });

  return `${OURA_AUTHORIZE_URL}?${params.toString()}`;
}

function basicAuthHeader() {
  const config = getConfig();
  const encoded = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

async function postToken(params) {
  const response = await fetch(OURA_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body.error_description ?? body.detail ?? body.title ?? "Oura token request failed.",
    );
  }

  return body;
}

function toStoredToken(tokenResponse, grantedScope) {
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    tokenType: tokenResponse.token_type,
    grantedScopes: grantedScope ?? tokenResponse.scope ?? null,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function exchangeCode({ code, scope, state }) {
  const storedState = await readOAuthState();
  if (!storedState?.state || storedState.state !== state) {
    throw new Error("Oura OAuth state mismatch.");
  }

  const config = getConfig();
  const tokenResponse = await postToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });
  const token = toStoredToken(tokenResponse, scope);
  await writeToken(token);
  return token;
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const token = await readToken();
    if (!token?.refreshToken) {
      throw new Error("No Oura refresh token is stored.");
    }

    const tokenResponse = await postToken({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });
    const nextToken = toStoredToken(tokenResponse, token.grantedScopes);
    await writeToken(nextToken);
    return nextToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function getValidToken() {
  const token = await readToken();
  if (!token?.accessToken) {
    throw new Error("Oura is not connected.");
  }

  const expiresAt = new Date(token.expiresAt).getTime();
  if (Number.isFinite(expiresAt) && expiresAt - Date.now() > 60_000) {
    return token;
  }

  return refreshAccessToken();
}

async function ouraFetch(path, params = {}) {
  let token = await getValidToken();
  const url = new URL(`${OURA_API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.accessToken}` },
  });

  if (response.status === 401) {
    token = await refreshAccessToken();
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail ?? body.title ?? `Oura request failed: ${response.status}`);
  }

  return body;
}

async function fetchAllDocuments(path, params) {
  const data = [];
  let nextToken = null;

  do {
    const body = await ouraFetch(path, { ...params, next_token: nextToken });
    data.push(...(body.data ?? []));
    nextToken = body.next_token ?? null;
  } while (nextToken);

  return data;
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function syncOuraDailyMetrics({ days = 60 } = {}) {
  const startDate = dateDaysAgo(days);
  const endDate = new Date().toISOString().slice(0, 10);
  const range = { start_date: startDate, end_date: endDate };

  const [dailySleep, dailyReadiness, sleep, dailySpo2] = await Promise.all([
    fetchAllDocuments("/usercollection/daily_sleep", range),
    fetchAllDocuments("/usercollection/daily_readiness", range),
    fetchAllDocuments("/usercollection/sleep", range),
    fetchAllDocuments("/usercollection/daily_spo2", range).catch(() => []),
  ]);

  const metrics = normalizeOuraDailyMetrics({
    dailySleep,
    dailyReadiness,
    sleep,
    dailySpo2,
  });

  const syncedAt = new Date().toISOString();
  await writeDailyMetrics(metrics);
  await writeRawSync({
    syncedAt,
    range,
    dailySleep,
    dailyReadiness,
    sleep,
    dailySpo2,
  });

  const token = await readToken();
  await writeToken({ ...token, lastSyncedAt: syncedAt });

  return { metrics, syncedAt };
}
