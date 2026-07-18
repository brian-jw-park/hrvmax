import "dotenv/config";
import express from "express";
import {
  buildAuthorizeUrl,
  exchangeCode,
  getConfig,
  isConfigured,
  syncOuraDailyMetrics,
} from "./ouraClient.js";
import { readDailyMetrics, readToken } from "./storage.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(express.json());

function asyncRoute(handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

app.get(
  "/api/oura/status",
  asyncRoute(async (_request, response) => {
    const token = await readToken();
    response.json({
      configured: isConfigured(),
      connected: Boolean(token?.accessToken),
      grantedScopes: token?.grantedScopes ?? null,
      lastSyncedAt: token?.lastSyncedAt ?? null,
      redirectUri: getConfig().redirectUri,
    });
  }),
);

app.get(
  "/api/oura/connect",
  asyncRoute(async (_request, response) => {
    const url = await buildAuthorizeUrl();
    response.redirect(url);
  }),
);

app.get(
  "/api/oura/callback",
  asyncRoute(async (request, response) => {
    if (request.query.error) {
      response.redirect(`/?oura=error&message=${encodeURIComponent(String(request.query.error))}`);
      return;
    }

    const code = String(request.query.code ?? "");
    const scope = request.query.scope ? String(request.query.scope) : null;
    const state = String(request.query.state ?? "");
    if (!code || !state) {
      throw new Error("Missing Oura OAuth callback code or state.");
    }

    await exchangeCode({ code, scope, state });
    await syncOuraDailyMetrics({ days: 60 });
    response.redirect("/?oura=connected");
  }),
);

app.get(
  "/api/oura/daily-metrics",
  asyncRoute(async (_request, response) => {
    const token = await readToken();
    const metrics = await readDailyMetrics();
    response.json({
      configured: isConfigured(),
      source: token?.accessToken && metrics.length ? "oura" : "fixture",
      connected: Boolean(token?.accessToken),
      grantedScopes: token?.grantedScopes ?? null,
      lastSyncedAt: token?.lastSyncedAt ?? null,
      metrics,
    });
  }),
);

app.post(
  "/api/oura/refresh",
  asyncRoute(async (_request, response) => {
    const result = await syncOuraDailyMetrics({ days: 60 });
    response.json({
      source: "oura",
      connected: true,
      lastSyncedAt: result.syncedAt,
      metrics: result.metrics,
    });
  }),
);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: error instanceof Error ? error.message : "Unexpected server error.",
  });
});

app.listen(port, () => {
  console.log(`HRVMax API listening on http://localhost:${port}`);
});
