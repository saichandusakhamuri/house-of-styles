# House of Styles Static Product API

This backend is a lightweight Node/Express API for the Tomcat/static catalog build.

MongoDB has been removed from the active runtime. Products and membership tiers are served from local static data files:

- `data/staticProducts.js`
- `data/staticMembershipTiers.js`

## What Works

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/memberships`

Product listing supports pagination plus `category`, `audience`, `search`, and `isFeatured` query filters.

## Disabled In This Build

These routes return `501` because they previously depended on database-backed user/order state:

- `/api/auth/*`
- `/api/orders/*`
- `/api/custom-orders/*`
- `/api/styles/*`
- `/api/users/*`
- `/api/payments/*`

Product create/update/delete also returns `405` because the catalog is static.

## Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:5001` by default.

## Tomcat

Serve the frontend from Apache Tomcat at `http://localhost:8080`. The backend CORS config already allows Tomcat local origins, so the Tomcat-hosted storefront can call `http://localhost:5001/api/products`.
