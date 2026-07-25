# Munch

Restaurant ordering PWA for **The Yard Milkshake Bar**.

A mobile-first progressive web application that lets customers browse the menu, customize items, place orders, track status in real time, and reorder past favorites.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS 3 |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (email/password + Google OAuth) |
| **Real-time** | Socket.io (order tracking & chat) |
| **PWA** | vite-plugin-pwa (manifest + service worker) |

---

## Project Structure

```
munch/
├── client/                    # React + Vite PWA
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI kit
│   │   │   ├── layout/       # Header, BottomNav, Layout
│   │   │   └── domain/       # Domain-specific (future milestones)
│   │   ├── pages/             # Route-level page components
│   │   ├── features/          # Feature modules (future)
│   │   ├── lib/               # Axios instance, utilities
│   │   ├── hooks/             # Custom hooks (future)
│   │   ├── context/            # React contexts (future)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                    # Express API
│   ├── src/
│   │   ├── config/           # DB connection, env config
│   │   ├── models/            # Mongoose schemas
│   │   ├── controllers/       # Route handlers (thin)
│   │   ├── routes/            # Express routers
│   │   ├── middleware/        # Auth, error handling, validation
│   │   ├── services/          # Business logic
│   │   └── sockets/           # Socket.io event handlers
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** 6+ (local or Atlas)
- A code editor

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

```bash
# Server
cd server
cp .env.example .env
```

Edit `server/.env` with your values. The server will **fail fast** if required
variables are missing.

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | API server port | `5000` |
| `NODE_ENV` | No | Environment mode | `development` |
| `CLIENT_URL` | No | Frontend URL (for CORS) | `http://localhost:5173` |
| `MONGODB_URI` | No | MongoDB connection string | `mongodb://localhost:27017/munch` |
| `JWT_SECRET` | **Yes** | Secret for signing JWT tokens | — |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (for future token verification) | — |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start Development Servers

In two terminals:

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

- **Client**: http://localhost:5173
- **API**: http://localhost:5000/api/v1/health

---

## Design System

### Colors

| Token | Hex |
|-------|-----|
| `brand.pink` | `#FF2D87` |
| `brand.pink-dark` | `#E0176B` |
| `brand.charcoal` | `#1F1B24` |
| `brand.cream` | `#FFF8F0` |
| `brand.cream-2` | `#FFEFDD` |
| `success` | `#2FAE6B` |
| `warning` | `#F5A623` |
| `error` | `#E5484D` |

### Typography

- **Display/Headings**: Baloo 2 (rounded, confident)
- **Body**: Inter (clean, legible at small sizes)
- **Numerals**: tabular-nums (consistent price widths)

### Spacing

- 4px scale with generous whitespace
- `rounded-2xl` (16px) for cards
- `rounded-full` for pills/buttons/tags

---

## Development Roadmap (P1 — Customer App)

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Project scaffold + Design system | ✅ |
| 2 | Auth (email/password + Google) + Profile shell | ✅ |
| 3 | Home / Discovery — browse, search, filters | ⬜ |
| 4 | Item detail + Customization + Favourites | ⬜ |
| 5 | Cart + Checkout (stubbed payment) | ⬜ |
| 6 | Order tracking with live timeline | ⬜ |
| 7 | Order history + Re-order | ⬜ |
| 8 | In-app chat (customer ↔ store) | ⬜ |
| 9 | Ratings & Reviews + Push notifications | ⬜ |
| 10 | Saved addresses + Profile polish + PWA offline | ⬜ |

---

## API Conventions

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <jwt>`
- Pagination: `?page=1&limit=20`
- Errors: `{ success: false, message, code }`

---

## License

Private — The Yard Milkshake Bar

