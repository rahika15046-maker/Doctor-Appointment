# Medora — Render.com Deployment Guide

## Option A — Recommended: Two Separate Services (API + Static Site)

### Step 1: Deploy the Backend API

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `rahika15046-maker/Doctor-Appointment`
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `medora-api` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Health Check Path** | `/api/health` |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://Radhika:Radhika652@cluster0.jflgsfy.mongodb.net/medora?appName=Cluster0` |
| `JWT_SECRET` | `medora-production-jwt-secret-key-32chars` |
| `PORT` | `10000` |

5. Click **Create Web Service** → note the URL (e.g. `https://medora-api.onrender.com`)

---

### Step 2: Deploy the Frontend Static Site

1. Go to Render → **New** → **Static Site**
2. Connect same GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `medora-client` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://medora-api.onrender.com` ← your API URL from Step 1 |

5. Add **Redirect/Rewrite Rule**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

6. Click **Create Static Site**

---

## Option B — Single Service (Full-Stack Monolith)

Use this if you want one Render service that serves both API and frontend.

1. Go to Render → **New** → **Web Service**
2. Configure:

| Setting | Value |
|---|---|
| **Name** | `medora` |
| **Root Directory** | *(leave empty — repo root)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install --prefix client && npm run build --prefix client && npm install --prefix server` |
| **Start Command** | `node server/server.js` |
| **Health Check Path** | `/api/health` |

3. Add **Environment Variables** (same as Step 1 above — `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `PORT`)

> **Note:** Do NOT set `VITE_API_URL` — the client will auto-use `/api` (same domain).

---

## Environment Variables Reference

```env
# Server (.env)
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://Radhika:Radhika652@cluster0.jflgsfy.mongodb.net/medora?appName=Cluster0
JWT_SECRET=medora-production-jwt-secret-key-32chars

# Client (only needed for separate deploy)
VITE_API_URL=https://medora-api.onrender.com
```

---

## Demo Login

```
Email:    patient@demo.medora
Password: Demo@1234
```
