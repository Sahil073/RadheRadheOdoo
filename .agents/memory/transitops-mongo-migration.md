---
name: TransitOps Postgres to MongoDB migration
description: Decisions made when migrating the TransitOps backend from Postgres to MongoDB/Mongoose, and the known frontend/backend contract mismatch.
---

## Decisions

- Kept the existing resource-specific REST shape (`/api/vehicles`, `/api/drivers`, `/api/trips`,
  etc., PUT for updates, snake_case field names) as the backend's source of truth. The frontend
  service layer (`frontend/src/services/*`) was later adapted to call this contract directly
  (field-name translation both ways, correct verbs/paths, lifecycle endpoints for trips/maintenance)
  instead of changing the backend — the old generic/camelCase/PATCH/localStorage contract and
  `services/storage.js` were removed. A Vite dev proxy (`/api` -> backend) makes this work without
  CORS/env-var wiring. **Why:** backend was already production-hardened with transactions/validation;
  cheaper to adapt the thinner frontend layer. **How to apply:** any new frontend service call must
  go through this same translation pattern (snake_case backend <-> camelCase UI), and lifecycle
  actions (trip dispatch/complete/cancel, maintenance close) must call the dedicated backend
  endpoints rather than generic PATCH, since side effects (vehicle/driver status) happen server-side
  in a transaction.
- `DataContext` (global data-fetch provider) must gate its fetch effect on `useAuth().user` being
  present — it is mounted above the router/login page, so fetching unconditionally on mount fires
  authenticated requests before login and floods the console with 401s.
- Old Postgres trigger logic (vehicle/driver availability, cargo capacity, license expiry,
  status transitions on dispatch/complete/cancel/maintenance) was reimplemented in the Node/
  Mongoose application layer using `session.withTransaction`.
  **Why:** Mongo has no trigger equivalent; transactions need a replica set, which Atlas provides
  by default even on the free tier. **How to apply:** any new multi-document status-transition
  logic on this backend should follow the same transaction pattern rather than relying on
  post-hoc consistency checks.
- Frontend runs on port 5000 (webview workflow), backend runs on port 8080 (console workflow) —
  kept separate because the frontend hardcodes port 5000 and defaults to localStorage unless
  `VITE_API_BASE_URL` is set.
