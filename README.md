# HRVMax

A local-first recovery dashboard prototype for Oura-shaped sleep, HRV, and readiness data.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

This starts both the local API server and the Vite web app.

Build for production:

```bash
npm run build
```

Build for GitHub Pages:

```bash
npm run build:pages
```

The first prototype uses fixture data in `src/data/ouraFixture.ts`. Real Oura OAuth, login, friends, and sync are intentionally deferred.

## Public Oura Application URLs

Once GitHub Pages is enabled for this repo, use:

```text
Website: https://brian-jw-park.github.io/hrvmax/
Privacy Policy: https://brian-jw-park.github.io/hrvmax/privacy/
Terms of Service: https://brian-jw-park.github.io/hrvmax/terms/
```

## Oura Local Setup

Create a local environment file:

```bash
cp .env.example .env
```

Fill in:

```bash
OURA_CLIENT_ID=
OURA_CLIENT_SECRET=
OURA_REDIRECT_URI=http://localhost:5173/api/oura/callback
OURA_SCOPES=daily spo2
```

In the Oura developer portal, register the same redirect URI:

```text
http://localhost:5173/api/oura/callback
```

Then start the app and use **Connect Oura** in the dashboard. Tokens and synced data are stored locally under `.local/`, which is ignored by git.
