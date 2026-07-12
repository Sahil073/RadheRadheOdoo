# 🚚 TransitOps

Live Link -> https://radheradheodoo-2.onrender.com

**A modern fleet management platform** — track vehicles, drivers, trips, maintenance, fuel, and expenses from a single dashboard, backed by a production-hardened REST API.

<p align="left">
  <img alt="Node" src="https://img.shields.io/badge/Node-Express%205-339933?logo=node.js&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-ISC-blue" />
</p>

---

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🖼️ Design & Workflow](#️-design--workflow)
- [🧩 Core Features](#-core-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔐 Roles & Permissions](#-roles--permissions)
- [🔄 Domain Model & Status Lifecycles](#-domain-model--status-lifecycles)
- [📡 API Reference](#-api-reference)
- [🚀 Getting Started](#-getting-started)
- [🌱 Seed Data & Demo Accounts](#-seed-data--demo-accounts)
- [🔧 Environment Variables](#-environment-variables)
- [🛡️ Security](#️-security)
- [🗺️ Roadmap](#️-roadmap)

---

## ✨ Overview

TransitOps is a full-stack logistics operations tool built for fleet managers, drivers, safety officers, and financial analysts to collaborate around one live source of truth. It replaces spreadsheets and side-channel messages with:

- A **live fleet dashboard** with KPIs (utilization, active trips, operational cost)
- **Trip lifecycle management** — from planning to dispatch to completion
- **Maintenance tracking** that automatically takes vehicles in/out of service
- **Fuel & expense logging** rolled up into per-vehicle cost reports
- **Role-based views** so each user only sees what's relevant to their job

---

## 🖼️ Design & Workflow



**End-to-end transport operations workflow**

![Workflow](docs/Workflow.png)

<table>
<tr>
<td width="33%" align="center">
<b>🚛 Vehicle Assignment</b><br/>
<img src="docs/Vehicle%20Assignment%20Flow.png" width="100%" />
</td>
<td width="33%" align="center">
<b>🗺️ Route Planning</b><br/>
<img src="docs/Route%20Planning.png" width="100%" />
</td>
<td width="33%" align="center">
<b>⛽ Fuel Calculation</b><br/>
<img src="docs/Fuel%20Calculation.png" width="100%" />
</td>
</tr>
</table>

---

## 🧩 Core Features

| Module | What it does |
|---|---|
| 📊 **Dashboard** | Live KPIs — total/available vehicles, active trips, fleet utilization %, fuel/maintenance/other costs, CSV export |
| 🚐 **Fleet** | Register vehicles, track odometer & capacity, retire vehicles, filter by type/status/region |
| 🧑‍✈️ **Drivers** | Manage licenses & expiry, safety scores, availability, suspension |
| 🧭 **Trips** | Plan a trip as a **Draft**, validate cargo against vehicle capacity, **Dispatch**, then **Complete** or **Cancel** |
| 🔧 **Maintenance** | Open a service ticket (vehicle auto-moves to *In Shop*), close it (vehicle auto-restored) |
| ⛽ **Fuel & Expenses** | Log fuel fill-ups and misc. expenses (tolls, fines, permits) per vehicle |
| 📈 **Analytics** | Regional filters, cost breakdowns, and operational reporting |
| 🔑 **Auth & Roles** | JWT-based login with per-role navigation and access control |

---

## 🏗️ Architecture

```
┌────────────────────┐        /api (Vite dev proxy)        ┌──────────────────────┐
│   Frontend (5000)  │ ───────────────────────────────────▶ │   Backend (8080)     │
│ React 19 + Vite     │  ◀─────────────────────────────────  │ Express 5 + Mongoose │
│ Tailwind + Radix UI │              JSON / JWT               │ MongoDB Atlas        │
└────────────────────┘                                       └──────────────────────┘
```

| Layer | Stack | Notes |
|---|---|---|
| **Frontend** | React 19, React Router 7, Vite 5, Tailwind CSS, Radix UI, Recharts, jsPDF | Served on port `5000`; talks to the backend via a `/api` dev proxy (see `vite.config.js`) |
| **Backend** | Express 5, Mongoose 8, JWT, bcrypt, express-validator, Helmet, express-rate-limit, morgan | Served on port `8080`; resource-based REST API over MongoDB |
| **Database** | MongoDB (Atlas-compatible) | Multi-document status transitions (dispatch/complete/cancel, maintenance open/close) run inside **Mongoose transactions** for atomicity |

**Key design decisions**

- ⚛️ **Transactional side-effects** — dispatching a trip, completing it, or opening/closing maintenance atomically updates the related vehicle/driver status alongside the record itself, so the fleet state never drifts out of sync.
- 🧱 **Resource-based REST contract** — dedicated routes and snake_case fields on the wire (`/api/vehicles`, `/api/trips/:id/dispatch`, …); the frontend service layer adapts this to camelCase for the UI.
- 🛡️ **Defense in depth** — Helmet security headers, tiered rate limiting (tighter on `/api/auth`), centralized error handling, and role-gated mutations.

---

## 📁 Project Structure

```
transitops/
├── backend/
│   ├── app.js                 # Express app: middleware, routes, error handling
│   ├── server.js               # Entrypoint: DB connect, listen, graceful shutdown
│   ├── config/db.js             # MongoDB connection
│   ├── models/                  # Mongoose schemas (Vehicle, Driver, Trip, ...)
│   ├── controllers/              # Route handlers & transactional business logic
│   ├── routes/                    # Express routers per resource
│   ├── middleware/                 # auth (JWT), requireRole, validate, errorHandler
│   ├── validators/                  # express-validator rule sets
│   ├── utils/                        # ApiError, asyncHandler, shared constants
│   └── seed/seed.js                   # Demo data seeding script
│
├── frontend/
│   └── src/
│       ├── pages/                # Route-level views (dashboard, fleet, trips, ...)
│       ├── components/            # Shared UI (sidebar, shadcn/radix primitives)
│       ├── context/                 # AuthContext & DataContext (global state)
│       ├── services/                  # API adapters (camelCase ↔ snake_case)
│       └── utils/constants.js           # Roles, statuses, permissions
│
├── docs/                       # Architecture diagrams
└── replit.md                   # Environment & maintainer notes
```

---

## 🔐 Roles & Permissions

| Role | Dashboard | Fleet | Drivers | Trips | Maintenance | Fuel & Expenses | Analytics | Settings |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🧑‍💼 **Fleet Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 🚗 **Driver** | ✅ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| 🦺 **Safety Officer** | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ |
| 💰 **Financial Analyst** | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ⬜ |
| 🛠️ **Admin** *(backend only)* | full API access — creates/updates vehicles & drivers alongside Fleet Manager | | | | | | | |

> Mutating endpoints (create/update/delete vehicles & drivers) require the `Fleet Manager` or `Admin` role server-side — enforced independently of the UI via `requireRole` middleware.

---

## 🔄 Domain Model & Status Lifecycles

**Trip lifecycle**

```
   Draft ──dispatch──▶ Dispatched ──complete──▶ Completed
                │
                └──cancel──▶ Cancelled
```

- **Dispatch**: vehicle & driver → `On Trip`
- **Complete**: vehicle & driver → `Available`, records final odometer & fuel consumed
- **Cancel**: only allowed from `Dispatched`; vehicle & driver → `Available`

**Vehicle & maintenance lifecycle**

```
Available ──open maintenance──▶ In Shop ──close maintenance──▶ Available
Available ──retire──▶ Retired (terminal)
```

| Entity | Statuses |
|---|---|
| 🚐 Vehicle | `Available` · `On Trip` · `In Shop` · `Retired` |
| 🧑‍✈️ Driver | `Available` · `On Trip` · `Off Duty` · `Suspended` |
| 🧭 Trip | `Draft` · `Dispatched` · `Completed` · `Cancelled` |
| 🔧 Maintenance | `Active` (UI: *Open*) · `Completed` (UI: *Closed*) |

---

## 📡 API Reference

Base URL: `/api` · All endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

### 🔑 Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a user account |
| `POST` | `/auth/login` | Authenticate, returns `{ token, user }` |
| `GET` | `/auth/me` | Get the current authenticated user |

### 🚐 Vehicles

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/vehicles` | any | List vehicles (filter by `?status=`) |
| `GET` | `/vehicles/:id` | any | Get a single vehicle |
| `POST` | `/vehicles` | Fleet Manager / Admin | Create a vehicle |
| `PUT` | `/vehicles/:id` | Fleet Manager / Admin | Update a vehicle |
| `DELETE` | `/vehicles/:id` | Fleet Manager / Admin | Soft-delete (retire) a vehicle |

### 🧑‍✈️ Drivers

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/drivers` | any | List drivers (filter by `?status=`) |
| `POST` | `/drivers` | Fleet Manager / Admin | Create a driver |
| `PUT` | `/drivers/:id` | Fleet Manager / Admin | Update a driver |
| `DELETE` | `/drivers/:id` | Fleet Manager / Admin | Soft-delete (suspend) a driver |

### 🧭 Trips

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/trips` | List trips |
| `POST` | `/trips` | Create a Draft trip |
| `PATCH` | `/trips/:id/dispatch` | Draft → Dispatched (transactional vehicle/driver update) |
| `PATCH` | `/trips/:id/complete` | Dispatched → Completed |
| `PATCH` | `/trips/:id/cancel` | Dispatched → Cancelled |

### 🔧 Maintenance

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/maintenance` | List maintenance logs |
| `POST` | `/maintenance` | Open a ticket (vehicle → In Shop) |
| `PATCH` | `/maintenance/:id/close` | Close a ticket (vehicle → Available) |

### ⛽ Fuel & 💵 Expenses

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/fuel` | List / log fuel fill-ups |
| `GET` / `POST` | `/expenses` | List / log misc. expenses |

### 📊 Dashboard & Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | KPI summary |
| `GET` | `/dashboard/export` | CSV export of the vehicle fleet |
| `GET` | `/health` | Service + DB connectivity check |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or self-hosted)

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Set the following secrets/env vars for the backend (see [Environment Variables](#-environment-variables)):

```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<a long random string>
```

### 3. Run

| Service | Command | Port |
|---|---|---|
| 🖥️ Backend | `npm start` (inside `backend/`) | `8080` |
| 🌐 Frontend | `npm run dev` (inside `frontend/`) | `5000` |

On Replit, both are already wired to the **`Backend`** and **`Frontend`** workflows — just click ▶️ Run.

### 4. Seed demo data

```bash
cd backend && npm run seed
```

This clears and repopulates vehicles, drivers, trips (at every lifecycle stage), maintenance logs, fuel logs, expenses, and demo user accounts.

---

## 🌱 Seed Data & Demo Accounts

All seeded accounts share the password **`password123`**:

| Email | Role |
|---|---|
| `manager@transitops.io` | 🧑‍💼 Fleet Manager |
| `driver@transitops.io` | 🚗 Driver |
| `safety@transitops.io` | 🦺 Safety Officer |
| `finance@transitops.io` | 💰 Financial Analyst |
| `admin@transitops.io` | 🛠️ Admin |

The seed also creates trips at **every stage of the lifecycle** (Draft, Dispatched, Completed, Cancelled) so the dashboard and trip board are populated realistically the moment you log in.

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Signing secret for JWTs; server refuses to boot without it |
| `PORT` | ⬜ | `8080` | Backend HTTP port |
| `CORS_ORIGIN` | ⬜ | `*` | Comma-separated list of allowed origins |

> 🔒 Secrets are managed via Replit's Secrets manager — never committed to source control.

---

## 🛡️ Security

- 🔐 **JWT authentication** on every protected route, with `requireRole()` guarding destructive/administrative mutations
- 🧂 **bcrypt** password hashing
- 🪖 **Helmet** for secure HTTP headers
- 🚦 **Rate limiting** — 300 req/15min general, 30 req/15min on `/api/auth` to slow down credential stuffing
- ✅ **express-validator** request validation on every write endpoint
- 🧯 **Centralized error handling** via `ApiError` + `errorHandler` — no stack traces leaked to clients
- ⚛️ **Atomic transactions** for every multi-document status change, preventing inconsistent fleet state

---


## 🗺️ Roadmap

- [ ] Real-time trip tracking (WebSocket/live map)
- [ ] Push/email notifications for license expiry & maintenance due dates
- [ ] Multi-tenant support for multiple fleet operators
- [ ] Automated PDF/CSV scheduled reporting

---

**High-level design**

<img width="900" alt="High level design" src="https://github.com/user-attachments/assets/9d768981-8e98-43f4-bcf5-f54a802fb8f2" />

<p align="center">Built with ❤️ for fleets that need to move fast — and stay accountable.</p>
