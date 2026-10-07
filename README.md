# Shopact

> **Record-keeping tool for Nigerian micro-retail shop owners.**  
> Fast, reliable transaction recording via fixed WhatsApp commands with an owner review and alert dashboard.

---

## 📌 Overview

Shopact helps retail shop owners preserve record correctness without complicated software. 

* **Staff & Owners** record sales, purchases, expenses, and customer credit directly within WhatsApp using 7 fixed command formats.
* **Shop Owners** access a dedicated web dashboard to review alerts (aging debts, low stock, large expenses), audit in-place record corrections, and export complete shop records.

---

## 🛠️ Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **ORM**: [Prisma](https://www.prisma.io/)
* **Database**: PostgreSQL (Serverless connection-pooled on production)
* **Messaging**: Meta WhatsApp Cloud API

---

## 💬 WhatsApp Command Interface

All commands use fixed, deterministic formats:

| Command | Format | Example | Action |
| :--- | :--- | :--- | :--- |
| **Record Sale** | `/sold <product> <qty>` | `/sold Indomie 2` | Validates current stock, deducts inventory, records sale. |
| **Record Purchase** | `/bought <product> <qty> <amount>` | `/bought Sugar 10 12000` | Increases stock, records inventory cost in naira (stored as kobo). |
| **Record Expense** | `/spent <amount> <note>` | `/spent 5000 fuel for generator` | Records expense with required explanation note. |
| **Record Customer Debt** | `/owa <name> <amount>` | `/owa Musa 3500` | Logs outstanding customer debt. |
| **Settle Debt** | `/paid <name>` | `/paid Musa` | Settles the customer's oldest open debt first. |
| **Check Low Stock** | `/stock` | `/stock` | Returns items at or below low-stock threshold. |
| **Check Debt Summary** | `/debts` | `/debts` | Returns total credit outstanding and age of oldest debt. |

---

## 🖥️ Dashboard Views

The owner dashboard provides oversight and administrative controls:

* **🚨 Alerts & Overview** (`/dashboard`): Immediate attention alerts for aging customer debts (≥ 7 days), low stock, and large expenses with WhatsApp reminder shortcuts.
* **💰 Sales** (`/sales`): Chronological log of recorded sales with actor attribution and in-place correction history.
* **📦 Inventory** (`/inventory`): Current inventory counts and threshold warnings.
* **🧾 Expenses** (`/expenses`): Filterable expense logs with mandatory notes.
* **⏳ Debts** (`/debts`): Aging debt analysis and settlement status.
* **⚙️ Settings & Export** (`/settings`): Alert threshold configurations and synchronous CSV exports across 6 business categories.
* **⏸️ Business Suspension** (`/suspended`): Automatic 3-month inactivity guard that pauses recording until reactivated by the shop owner, keeping records preserved indefinitely.

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.17+ or v20+)
* [PostgreSQL](https://www.postgresql.org/) (local or cloud-hosted)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/phebiannwokeji-cmd/shopact.git
cd shopact
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the required environment variables:
* `DATABASE_URL`: PostgreSQL connection string.
* `WHATSAPP_TOKEN`: Meta WhatsApp Cloud API token.
* `WHATSAPP_VERIFY_TOKEN`: Custom webhook handshake token.
* `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp Phone Number ID.
* `APP_SECRET`: Meta App Secret for HMAC signature verification.
* `SESSION_SECRET`: 32+ character random secret.

### 4. Database Setup & Prisma
Generate the Prisma Client:
```bash
npx prisma generate
```
Synchronize the database schema:
```bash
npx prisma db push
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Build & Deployment

* Run the production build locally:
  ```bash
  npm run build
  ```
* For deploying to **Vercel** with a serverless-ready cloud PostgreSQL database (Neon / Supabase), see the complete guide in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📄 License
Private & Proprietary — Shopact.
