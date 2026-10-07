# Shopact Deployment Guide (Vercel & Cloud PostgreSQL)

This document provides step-by-step instructions for deploying Shopact to Vercel and configuring online PostgreSQL hosting, environment variables, and the Meta WhatsApp Cloud API webhook.

---

## 1. Cloud PostgreSQL Setup (Serverless-Ready)

Shopact requires an online PostgreSQL database reachable by Vercel serverless functions. Because Vercel functions scale dynamically, use a managed provider with built-in connection pooling (e.g., **Neon**, **Supabase**, or **Vercel Postgres**).

### Recommended: Neon (Serverless Postgres with PgBouncer Pooling)
1. Sign in to [Neon](https://neon.tech/) and create a new project (e.g., `shopact-db`).
2. Copy the **Connection Details**:
   - **Pooled connection string** (uses port 5432 or 6543 with `?pgbouncer=true&connection_limit=1` or `-pooler` endpoint host):
     ```text
     DATABASE_URL="postgresql://[user]:[password]@[pooler-host]/[dbname]?sslmode=require&pgbouncer=true&connection_limit=1"
     ```
   - **Direct connection string** (for running schema migrations):
     ```text
     DIRECT_URL="postgresql://[user]:[password]@[direct-host]/[dbname]?sslmode=require"
     ```

### Initialize Database Schema Online (Execute Locally)
From your local terminal, apply the Prisma schema to your newly provisioned cloud database without altering migration history:
```bash
# Push schema structure to the online database
DATABASE_URL="your_cloud_direct_or_pooled_url" npx prisma db push
```
*(Note: As per safety guidelines, this operation must be run by the project owner; the agent does not execute database operations or live migrations).*

---

## 2. Environment Variables Configuration

Configure the following environment variables in your **Vercel Project Settings** (`Settings` -> `Environment Variables`):

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview | Pooled PostgreSQL connection string |
| `WHATSAPP_TOKEN` | Production, Preview | Permanent or System User token from Meta Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | Production, Preview | Custom secret string used during Meta Webhook handshake |
| `WHATSAPP_PHONE_NUMBER_ID`| Production, Preview | Phone Number ID from WhatsApp App Dashboard |
| `APP_SECRET` | Production, Preview | Meta App Secret (used for HMAC SHA-256 signature verification) |
| `SESSION_SECRET` | Production, Preview | 32+ character random secret string |
| `GEMINI_API_KEY` | Production, Preview | Optional / Gemini Free Tier API key |

---

## 3. Deploying to Vercel

### Option A: Via Git / GitHub (Recommended)
1. Initialize Git in the project root (if not already done):
   ```bash
   git init
   git add .
   git commit -m "chore: prepare Shopact for Vercel deployment"
   ```
2. Push the repository to your private GitHub/GitLab account:
   ```bash
   git remote add origin https://github.com/<your-username>/shopact.git
   git branch -M main
   git push -u origin main
   ```
3. In [Vercel Dashboard](https://vercel.com/):
   - Click **Add New Project** -> **Import Git Repository**.
   - Select your `shopact` repository.
   - Framework Preset: **Next.js** (detected automatically).
   - Build Command: `npm run build` (`prisma generate && next build` is pre-configured).
   - Enter the Environment Variables listed in Section 2.
   - Click **Deploy**.

### Option B: Via Vercel CLI
1. Install and log in:
   ```bash
   npx vercel login
   ```
2. Link and deploy:
   ```bash
   npx vercel
   # Follow prompts to link project
   npx vercel env add DATABASE_URL
   # Add remaining env variables
   npx vercel --prod
   ```

---

## 4. Meta WhatsApp Webhook Configuration

Once Vercel assigns your production domain (e.g. `https://shopact-xyz.vercel.app`):
1. Go to the **Meta for Developers** console -> Your WhatsApp App -> **WhatsApp** -> **Configuration**.
2. Under **Webhook**, click **Edit**:
   - **Callback URL**: `https://<your-domain>.vercel.app/api/whatsapp/webhook`
   - **Verify Token**: Enter the exact string set in `WHATSAPP_VERIFY_TOKEN`.
   - Click **Verify and Save**. Meta will issue a GET challenge to verify the endpoint.
3. Under **Webhook fields**, click **Manage** and subscribe to:
   - `messages`

---

## 5. Post-Deployment Verification

1. **Dashboard Check**: Navigate to `https://<your-domain>.vercel.app/dashboard` and verify the page loads.
2. **Webhook Health**: In Meta developer portal, verify the webhook status displays active.
3. **Command Test**: Send a WhatsApp test message from a registered phone number (e.g., `/stock` or `/debts`) and confirm the response.
