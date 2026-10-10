# Nuvora Multi-Vendor E-Commerce Marketplace

Nuvora is a production-ready, secure, scalable, multi-vendor e-commerce marketplace platform built with **Next.js 14**, **NestJS**, **Prisma ORM**, and **PostgreSQL**.

Inspired by major online marketplaces like Jumia and Konga, Nuvora supports both direct platform sales and independent third-party sellers with multi-seller orders, escrow protected Paystack online payments, automated seller ledger balance calculations, and dedicated customer, seller, and super-admin portals.

---

## 🏗️ System Architecture

```
nuvora/
├── apps/
│   ├── api/          # NestJS REST API v1 (Prisma, JWT Auth, RBAC, Paystack integration, Ledger)
│   └── web/          # Next.js 14 App Router (Tailwind CSS, Storefront, Dashboards)
└── packages/
    └── shared/       # Shared business logic (Integer Minor Units, Commission rules, State machines)
```

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL Database** (running locally or remote instance)

### 2. Environment Setup
Copy the environment template files in `apps/api`:
```bash
cp apps/api/.env.example apps/api/.env
```

Ensure `DATABASE_URL` in `apps/api/.env` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nuvora?schema=public"
PORT=4000
NODE_ENV=development
APP_SECRET="super-secret-jwt-key-nuvora-2026-marketplace"
PAYSTACK_SECRET_KEY="sk_test_xxx"
PAYSTACK_PUBLIC_KEY="pk_test_xxx"
PAYSTACK_WEBHOOK_SECRET="whsec_xxx"
```

### 3. Build Shared Package & Generate Database Schema
```bash
# Build shared money & commission business logic
npm run build:shared

# Run shared unit tests (26 passing tests)
npm test -w @nuvora/shared

# Generate Prisma ORM Client
npm run db:generate
```

### 4. Database Seeding
Seed initial categories, super admin account, verified sample sellers, and sample products:
```bash
npm run db:seed
```

Default Seed Accounts:
- **Super Admin**: `admin@nuvora.com` / `SuperAdmin2026!`
- **Sample Seller**: `techstore@nuvora.com` / `Seller2026!`

---

## 🏃 Running the Application

Start the NestJS backend and Next.js frontend concurrently in development mode:

```bash
# Start NestJS API on http://localhost:4000/api/v1
npm run dev:api

# Start Next.js Storefront on http://localhost:3000
npm run dev:web
```

OpenAPI Swagger documentation is accessible at:
👉 **[http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)**

---

## 📊 Key Features Across Phases

### Phase 1: Core Functional MVP
- **Multi-Seller Checkout**: Automatically derives parent checkout order, per-seller sub-orders, and separate shipment records.
- **Financial Precision**: Money stored in integer minor units (kobo).
- **Paystack Payment Gateway**: Server-created transactions, reference verification, and HMAC sha512 webhooks.
- **Role-Based Access Control**: `CUSTOMER`, `SELLER`, `STAFF`, `SUPER_ADMIN`.

### Phase 2: Trust & Operations
- **Verified Purchase Reviews**: 1–5 star ratings and review moderation.
- **Return & Refund Workflows**: Proportional commission reversals upon refund completion.
- **Promotional Coupons**: Percentage and fixed discount codes at checkout.
- **Seller Payouts**: Balance ledger tracking and discursment request management.

### Phase 3 & 4: Analytics & Polish
- **Product Recommendations**: Popularity and category-driven recommendations.
- **Production Build Ready**: Zero compiler errors across all monorepo workspaces.

### Phase 5: Enterprise Dispute Resolution, Compliance & Deployment
- **Customer Support Desk & Disputes**: Dedicated `/support` ticket portal, order-linked dispute threads, conversation replies, and status management.
- **Real-Time In-App Notification Center**: Activity bell with dynamic unread badges, order/payment/shipment alerts, and mark-as-read controls.
- **Seller KYC Compliance & Moderation**: CAC certificate, National ID, and proof-of-address upload in `/seller` with admin review & verification in `/admin`.
- **System Health & Observability**: Dedicated `/api/v1/health` monitoring database connectivity, process uptime, and environment state.
- **Production DevOps & Containerization**: Multi-stage `Dockerfile.api`, `Dockerfile.web`, and `docker-compose.yml` for zero-downtime deployment.

---

## 🔒 Security Practices
- Password hashing with **bcrypt**.
- JWT bearer tokens for API authentication.
- Atomic database transactions to prevent inventory overselling.
- Server-side validation of prices, discounts, and delivery fees.