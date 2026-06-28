# Contact Manager

A full-stack contact manager: an Express + MongoDB REST API and a React (Vite) frontend.

```
.
├── backend/     # Express 5 + Mongoose REST API
└── front-end/   # React + Vite single-page app
```

## Features

- Register / login with username + password
- **Sign in with Google** (OAuth)
- **Real logout** — JWT access tokens + DB-stored refresh tokens that are revoked on logout
- Per-user contacts CRUD (name, phone, email, age) with search
- Profile page, responsive modern UI

## Auth model

- **Access token** — short-lived JWT (default 15m), sent in the `Authorization: Bearer` header.
- **Refresh token** — long-lived JWT (default 7d), stored in the DB and sent as an
  `httpOnly` cookie. Logout deletes it from the DB, so it can no longer mint access tokens.
- The frontend silently refreshes the access token on a `401`.

---

## 1. Backend

```bash
cd backend
npm install
npm run dev      # nodemon, or: npm start
```

Configure `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 5001) |
| `uri` | MongoDB connection string |
| `JWT_SECRET` | signs access tokens |
| `REFRESH_TOKEN_SECRET` | signs refresh tokens (use a long random string) |
| `ACCESS_TOKEN_TTL` | access-token lifetime, e.g. `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | refresh-token lifetime in days |
| `CLIENT_URL` | frontend origin for CORS (`http://localhost:5173`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NODE_ENV` | `development` / `production` (controls secure cookies) |

### API routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/users/register` | – | Create account (auto-login) |
| POST | `/api/users/login` | – | Login with username/password |
| POST | `/api/users/google` | – | Login/register with a Google ID token |
| POST | `/api/users/refresh` | cookie | Get a new access token |
| POST | `/api/users/logout` | cookie | Revoke refresh token |
| GET  | `/api/users/current` | Bearer | Current user |
| GET/POST | `/api/contacts` | Bearer | List / create contacts |
| GET/PUT/DELETE | `/api/contacts/:id` | Bearer | Read / update / delete |

---

## 2. Frontend

```bash
cd front-end
npm install
npm run dev      # http://localhost:5173
```

Configure `front-end/.env`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | backend base URL (`http://localhost:5001/api`) |
| `VITE_GOOGLE_CLIENT_ID` | **same** Google client ID as the backend |

---

## 3. Enabling Google sign-in (free)

The code is complete; you only need a Client ID:

1. Go to <https://console.cloud.google.com> → **APIs & Services → Credentials**.
2. **Create credentials → OAuth client ID → Web application**.
3. Under **Authorized JavaScript origins** add `http://localhost:5173`.
4. Copy the **Client ID** into both:
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `front-end/.env` → `VITE_GOOGLE_CLIENT_ID`
5. Restart both servers. The Google button appears automatically once a real
   Client ID is set (until then it shows a disabled placeholder).
