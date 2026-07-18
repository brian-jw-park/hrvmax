import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const localDir = path.resolve(process.cwd(), ".local");
const tokenPath = path.join(localDir, "oura-token.json");
const statePath = path.join(localDir, "oura-oauth-state.json");
const dataPath = path.join(localDir, "oura-daily-metrics.json");
const rawPath = path.join(localDir, "oura-raw-sync.json");

async function ensureLocalDir() {
  await mkdir(localDir, { recursive: true });
}

async function readJson(filePath, fallback = null) {
  try {
    const file = await readFile(filePath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await ensureLocalDir();
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function readToken() {
  return readJson(tokenPath);
}

export async function writeToken(token) {
  await writeJson(tokenPath, token);
}

export async function readOAuthState() {
  return readJson(statePath);
}

export async function writeOAuthState(state) {
  await writeJson(statePath, state);
}

export async function readDailyMetrics() {
  return readJson(dataPath, []);
}

export async function writeDailyMetrics(metrics) {
  await writeJson(dataPath, metrics);
}

export async function writeRawSync(raw) {
  await writeJson(rawPath, raw);
}
