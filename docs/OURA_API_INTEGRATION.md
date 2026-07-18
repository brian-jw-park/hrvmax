# Oura API Integration Notes

Last updated: July 18, 2026  
Primary sources:

- Oura API V2 reference: https://cloud.ouraring.com/v2/docs
- Oura OAuth docs: https://cloud.ouraring.com/docs/authentication
- Oura error handling docs: https://cloud.ouraring.com/docs/error-handling
- Oura API organization help article: https://partnersupport.ouraring.com/hc/en-us/articles/20949682312211-The-Oura-API

## 1. Source Of Truth

Oura's V2 documentation is a generated ReDoc page backed by:

```text
https://cloud.ouraring.com/v2/static/json/openapi-1.35.json
```

Use that OpenAPI file as the source of truth when building the client. It currently reports:

- Title: `Oura API Documentation`
- Version: `2.0`
- Spec file version in URL: `openapi-1.35.json`

## 2. Product Implication For HRVMax

The dashboard currently shows:

- Sleep score
- Readiness score
- HRV average
- Resting heart rate
- Sleep duration
- Sleep efficiency
- Bedtime / wake time
- Temperature deviation
- Respiratory rate
- SpO2

Those do not all come from one endpoint.

Required first endpoints:

- `GET /v2/usercollection/daily_sleep`
- `GET /v2/usercollection/daily_readiness`
- `GET /v2/usercollection/sleep`

Useful next endpoints:

- `GET /v2/usercollection/daily_spo2`
- `GET /v2/usercollection/daily_stress`
- `GET /v2/usercollection/sleep_time`
- `GET /v2/usercollection/ring_battery_level`
- `GET /v2/usercollection/daily_activity`

For our dashboard, the sync layer should join records by `day`, then normalize them into our `DailyMetric` shape.

## 3. Authentication

Oura supports OAuth2.

Authorize URL:

```text
https://cloud.ouraring.com/oauth/authorize
```

Token URL:

```text
https://api.ouraring.com/oauth/token
```

Base API URL:

```text
https://api.ouraring.com/v2
```

Access tokens are sent as bearer tokens:

```http
Authorization: Bearer ACCESS_TOKEN
```

### 3.1 Server-Side OAuth Flow

Use this for HRVMax once we connect real data.

1. Send user to Oura:

```text
GET https://cloud.ouraring.com/oauth/authorize
  ?response_type=code
  &client_id=...
  &redirect_uri=...
  &scope=daily+spo2
  &state=...
```

2. Oura redirects back:

```text
GET /callback?code=...&scope=...&state=...
```

3. Exchange code for token:

```http
POST https://api.ouraring.com/oauth/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=authorization_code&code=...&redirect_uri=...
```

4. Store:

- `access_token`
- `refresh_token`
- `expires_in`
- granted `scope`

Important: Oura refresh tokens are single-use. Every refresh returns a new access token and a new refresh token; replace the stored refresh token atomically.

### 3.2 Client-Side Only Flow

Oura also documents a client-side flow with `response_type=token`, but it does not return refresh tokens. Tokens currently expire after 30 days in that flow, requiring re-authentication.

Do not use this for the connected HRVMax implementation unless this remains a purely local toy. For anything persistent, use a backend.

## 4. Scopes

Official scopes:

- `email`: email address
- `personal`: gender, age, height, weight
- `daily`: daily summaries of sleep, activity, and readiness
- `heartrate`: time-series heart rate for Gen 3 users
- `workout`: auto-detected and user-entered workouts
- `tag`: user-entered tags
- `session`: guided and unguided Oura sessions
- `spo2`: daily SpO2 average recorded during sleep

Oura users can approve fewer scopes than requested. Store granted scopes and handle missing data gracefully.

Recommended HRVMax first scope set:

```text
daily spo2
```

Reason:

- `daily` covers daily sleep/readiness/activity summaries and detailed sleep.
- `spo2` adds the SpO2 field we already display.
- We do not need `email`, `personal`, `workout`, `tag`, or `session` for the first personal dashboard.
- We do not need `heartrate` unless we add full day heart-rate timelines; detailed sleep already contains sleep HR/HRV summary fields and samples.

## 5. Endpoint Shapes

Most daily/document endpoints share this response shape:

```ts
type MultiDocumentResponse<T> = {
  data: T[];
  next_token: string | null;
};
```

Most document endpoints accept:

- `start_date`
- `end_date`
- `next_token`
- `fields`

Time-series endpoints accept:

- `start_datetime`
- `end_datetime`
- `next_token`
- `latest`
- `fields`

Always follow pagination while `next_token` is present.

## 6. Key Endpoints For HRVMax

### 6.1 Daily Sleep

```http
GET /v2/usercollection/daily_sleep?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Important fields:

- `id`
- `day`
- `score`
- `contributors`
- `timestamp`

`daily_sleep.score` is the sleep score shown in the dashboard.

### 6.2 Detailed Sleep

```http
GET /v2/usercollection/sleep?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Important fields:

- `day`
- `type`
- `bedtime_start`
- `bedtime_end`
- `average_hrv`
- `average_heart_rate`
- `lowest_heart_rate`
- `total_sleep_duration`
- `time_in_bed`
- `efficiency`
- `average_breath`
- `deep_sleep_duration`
- `rem_sleep_duration`
- `light_sleep_duration`
- `awake_time`
- `heart_rate`
- `hrv`
- `sleep_phase_5_min`
- `sleep_phase_30_sec`
- `readiness`

For one day, Oura can return multiple sleep periods such as a main sleep plus naps. The field `type` can be:

- `long_sleep`
- `sleep`
- `late_nap`
- `rest`
- `deleted`

First HRVMax rule:

- Prefer `type === "long_sleep"` for nightly dashboard fields.
- If no `long_sleep`, use the non-deleted sleep record with the largest `total_sleep_duration`.
- Exclude `deleted` and `rest`.
- Keep all records in raw data for future recap/nap features.

### 6.3 Daily Readiness

```http
GET /v2/usercollection/daily_readiness?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Important fields:

- `day`
- `score`
- `temperature_deviation`
- `temperature_trend_deviation`
- `contributors`

Readiness contributors include:

- `activity_balance`
- `body_temperature`
- `hrv_balance`
- `previous_day_activity`
- `previous_night`
- `recovery_index`
- `resting_heart_rate`
- `sleep_balance`
- `sleep_regularity`

### 6.4 Daily SpO2

```http
GET /v2/usercollection/daily_spo2?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Important fields:

- `day`
- `spo2_percentage`
- `breathing_disturbance_index`

SpO2 can be missing depending on ring generation, settings, membership, or data availability.

### 6.5 Heart Rate Time Series

```http
GET /v2/usercollection/heartrate?start_datetime=ISO&end_datetime=ISO
```

Important fields:

- `timestamp`
- `timestamp_unix`
- `bpm`
- `source`

This is not required for the first real dashboard because detailed sleep includes sleep-period heart-rate samples and average heart rate. Add it later if we want full-day charts.

### 6.6 Ring Battery

```http
GET /v2/usercollection/ring_battery_level?latest=true
```

Important fields:

- `timestamp`
- `level`
- `charging`
- `in_charger`

Useful later for a Flighty-like "device/data status" indicator.

## 7. Normalization Into Current App Shape

Current fixture type:

```ts
type DailyMetric = {
  date: string;
  sleepScore: number;
  readinessScore: number;
  hrvAvg: number;
  restingHr: number;
  sleepDurationMinutes: number;
  sleepEfficiency: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  temperatureDeviation: number;
  respiratoryRate: number;
  spo2Avg: number;
};
```

Mapping:

```text
date                    <- daily_readiness.day or daily_sleep.day
sleepScore              <- daily_sleep.score
readinessScore          <- daily_readiness.score
hrvAvg                  <- sleep.average_hrv
restingHr               <- sleep.lowest_heart_rate or sleep.average_heart_rate
sleepDurationMinutes    <- sleep.total_sleep_duration / 60
sleepEfficiency         <- sleep.efficiency
bedtimeStart            <- sleep.bedtime_start
bedtimeEnd              <- sleep.bedtime_end
temperatureDeviation    <- daily_readiness.temperature_deviation
respiratoryRate         <- sleep.average_breath
spo2Avg                 <- daily_spo2.spo2_percentage.average
```

Note: the Oura spec says `average_heart_rate` and `lowest_heart_rate` in the `sleep` endpoint are calculated differently from what the Oura app displays in some places. For HRVMax, label this clearly as "sleep RHR" if using `lowest_heart_rate`.

## 8. Sync Strategy

### 8.1 First Backfill

Fetch at least 30 days so baseline calculations work immediately.

Recommended:

- Fetch last 60 days for first version.
- Later, consider 365 days if we build Wrapped-style recaps.

Call:

- `daily_sleep`
- `daily_readiness`
- `sleep`
- `daily_spo2`

Use pagination for every endpoint.

### 8.2 Refresh Sync

Oura data is not real-time and can be revised after initial processing.

On refresh:

- Re-fetch last 14 days for daily summary endpoints.
- Re-fetch last 14 days for detailed sleep.
- Re-fetch last 14 days for SpO2.

Reason:

- Ring sync can lag.
- The Oura app may not have uploaded yet.
- Oura Cloud processing can finish later.
- Naps, edited sleeps, workouts, and delayed syncs can revise summaries.

### 8.3 Manual Refresh First

For this project, implement manual refresh before background jobs.

First connection version:

- Connect Oura
- Fetch last 60 days
- Store normalized data locally/server-side
- Show "Last refreshed" timestamp
- Add a "Refresh" button

Background sync can wait.

## 9. Error Handling

Oura error responses generally include:

- `status`
- `title`
- `detail`

OAuth errors also include OAuth fields such as:

- `error`
- `error_description`
- `error_uri`

Important cases:

- `401 invalid_token`: token missing, invalid, expired, malformed, or revoked.
- `401/400 invalid_grant`: authorization code or refresh token invalid, expired, revoked, reused, or mismatched.
- Missing scopes: user did not grant required scope; re-authenticate with needed scope.
- Redirect URI mismatch: redirect URI must match the registered app and the authorization-code exchange.
- Rate limit: Oura V1 and V2 are limited to 5000 requests per 5 minutes.

Refresh-token bug to avoid:

- Never call token refresh concurrently for the same connection.
- A refresh token is single-use, so two simultaneous refreshes can burn the valid token and leave storage with a revoked token.
- Use a per-user refresh lock or serialize Oura requests through one refresh helper.

## 10. Webhooks

Oura has webhook subscription endpoints:

- `GET /v2/webhook/subscription`
- `POST /v2/webhook/subscription`
- `GET /v2/webhook/subscription/{id}`
- `PUT /v2/webhook/subscription/{id}`
- `DELETE /v2/webhook/subscription/{id}`
- `PUT /v2/webhook/subscription/renew/{id}`

Create request:

```ts
type CreateWebhookSubscriptionRequest = {
  callback_url: string;
  verification_token: string;
  event_type: "create" | "update" | "delete";
  data_type:
    | "tag"
    | "enhanced_tag"
    | "workout"
    | "session"
    | "sleep"
    | "daily_sleep"
    | "daily_readiness"
    | "daily_activity"
    | "daily_spo2"
    | "sleep_time"
    | "rest_mode_period"
    | "ring_configuration"
    | "daily_stress"
    | "daily_cardiovascular_age"
    | "daily_resilience"
    | "vo2_max"
    | "meal";
};
```

Do not start with webhooks. Add them when:

- We have a deployed HTTPS callback URL.
- We have persistent user/token storage.
- Manual refresh works.
- We want fresher updates without polling.

## 11. Membership And Availability Caveats

Oura's organization help article says Gen3 Oura Ring users need an active Oura Membership for API data access. Users also need a recent Oura mobile app version for newer API V2 data types.

Build graceful missing-data states for:

- No active membership
- Older ring generation
- Missing SpO2
- Missing detailed sleep records
- User denied one or more scopes
- Oura data not synced yet

## 12. Recommended Implementation Path For This Repo

Current app is a Vite-only client. A real OAuth client secret cannot safely live in this frontend.

Recommended next steps:

1. Add a tiny backend surface.
   - Either migrate to Next.js route handlers, or add a small Express server.
   - For minimal disruption, Express is easiest.
2. Register an Oura API application.
   - Redirect URI for local dev: `http://localhost:5173/api/oura/callback` if using the same dev server proxy, or `http://localhost:8787/api/oura/callback` if using a separate backend.
3. Add environment variables:
   - `OURA_CLIENT_ID`
   - `OURA_CLIENT_SECRET`
   - `OURA_REDIRECT_URI`
   - `OURA_SCOPES=daily spo2`
4. Implement routes:
   - `GET /api/oura/connect`
   - `GET /api/oura/callback`
   - `POST /api/oura/refresh`
   - `GET /api/oura/daily-metrics`
5. Store tokens for local-only dev.
   - First version can use a local ignored JSON file.
   - Do not commit real tokens.
6. Fetch and normalize:
   - `daily_sleep`
   - `daily_readiness`
   - `sleep`
   - `daily_spo2`
7. Replace fixture import with API-loaded data.
   - Keep fixture data as fallback/sample mode.

## 13. First-Code Decision

For HRVMax, I would implement the connection as:

- Vite frontend remains.
- Add `server/` Express backend.
- Vite proxies `/api` to backend in development.
- Backend stores local token/data files under ignored `.local/`.
- Frontend loads `/api/oura/daily-metrics`.
- If no connection exists, frontend uses fixture data and shows a "Connect Oura" action.

This keeps the prototype moving without prematurely migrating the whole app to Next.js or Supabase.
