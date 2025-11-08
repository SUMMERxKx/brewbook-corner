# BrewBook Project Summary

## Project Overview
BrewBook is a MERN social platform where users pick a side (coffee or tea), share recipes, interact with friends, and now enjoy AI-assisted experiences. The project is organized with dedicated `backend/` and `frontend/` packages and includes the following headline features:

- ☕🍵 **AI Barista / Tea Brewer** – conversational assistant that generates personalized recipes, with export to PDF/Markdown/clipboard.
- 🌐 **Multi-feed Home Experience** – Discover (global), Friends, and My Side feeds with animated transitions and React Context state management.
- 🗺️ **Map View** (temporarily disabled) – location-aware discovery of nearby cafés/tea houses using Google Maps Places API (with OpenStreetMap fallback).
- 🔄 **Side-aware Theming** – global ThemeContext automatically syncs UI palette (coffee vs. tea) across the app.

The repository is ready for local development, deployment, and ongoing feature work.

## Project Structure
```
brewbook/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth (register/login)
│   │   ├── postController.js      # Posts + multi-feed endpoints
│   │   ├── commentController.js   # Comments
│   │   └── aiController.js        # AI Barista (Gemini integration)
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js                # User schema (friends, avatars, side)
│   │   ├── Post.js                # Post schema
│   │   └── Comment.js             # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── postRoutes.js          # /api/posts + /discover|/friends|/side
│   │   ├── commentRoutes.js       # /api/comments
│   │   ├── aiRoutes.js            # /api/ai/barista
│   │   └── uploadRoutes.js        # /api/upload (image uploads)
│   ├── server.js                  # Express server + Socket.IO setup
│   ├── package.json               # Backend dependencies
│   ├── .env.example               # Backend env template
│   └── (create `.env` from template – not committed)
│
├── frontend/                       # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/                  # HTTP clients (auth, posts, ai, etc.)
│   │   ├── components/           # UI components (Navbar, FeedTabs, etc.)
│   │   ├── context/              # AuthContext, ThemeContext, FeedContext
│   │   ├── pages/                # Feed, Barista, MapView, etc.
│   │   ├── hooks/                # Custom hooks
│   │   └── types/                # Shared TS types
│   ├── package.json              # Frontend dependencies
│   ├── .env.example              # Frontend env template
│   └── (create `.env` from template – not committed)
│
├── README.md                       # Main documentation
├── PROJECT_SUMMARY.md              # High-level project overview (this file)
├── FEATURES_IMPLEMENTATION.md      # Historical feature log
├── IMAGE_URL_FIX.md                # Notes on image handling
├── SETUP.md                        # Quick setup instructions
└── .gitignore                      # Git ignore rules
```

## Technology Stack

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** (`jsonwebtoken`)
- **bcrypt** (password hashing)
- **Helmet**, **CORS** (security)
- **dotenv** for configuration
- **Socket.IO** (real-time chat support)
- **Gemini Generative AI SDK** (AI Barista – optional)

### Frontend
- **React 18** + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** + **shadcn/ui** components
- **Framer Motion** animations
- **Axios** HTTP client
- **jsPDF** for PDF export

## Environment Configuration
Environment secrets live outside source control. Copy the provided templates and fill in your values.

### Backend (`backend/.env` – create from `.env.example`)
```
PORT=5001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8080
GEMINI_API_KEY=your-gemini-api-key   # optional – enables AI Barista
UPLOADS_DIR=uploads
```
- AI Barista falls back to canned responses when `OPENAI_API_KEY` is absent.

### Frontend (`frontend/.env` – create from `.env.example`)
```
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=             # optional – map currently disabled but key retained for future use
```
- Map View is temporarily disabled; keeping the key simplifies reactivation.

## API Surface

### Authentication
- `POST /api/auth/register` – body `{ username, email, password, side }`
- `POST /api/auth/login` – body `{ email, password }`

### Posts & Feeds
- `GET /api/posts` – optional `?side=coffee|tea`
- `GET /api/posts/:id`
- `POST /api/posts` – create post (auth)
- `POST /api/posts/:id/like` – toggle like (auth)
- `GET /api/posts/discover` – global feed (public)
- `GET /api/posts/friends` – friends feed (auth)
- `GET /api/posts/side` – same-side feed (auth)

### Comments
- `POST /api/posts/:id/comments` – add comment (auth)
- `GET /api/comments/:postId`

### AI Barista
- `POST /api/ai/barista` – body `{ prompt, side }`, returns conversational response + structured recipe

### Uploads
- `POST /api/upload` – multipart/form-data (`image` field); returns `{ message, url, path }`

## Current Status (Nov 2025)

### ✅ Shipped & Verified
1. **AI Barista Assistant** powered by Gemini + PDF/Markdown/clipboard export.
2. **Multi-feed experience** with cached state via FeedContext and animated transitions.
3. **MapView page** scaffold (temporarily disabled) previously backed by Google Places with OpenStreetMap fallback.
4. **Side-aware ThemeContext** automatically updates palettes + Navbar side indicator.
5. **AuthContext update utility** to sync user side changes across UI/theme.
6. **Backend feed endpoints** (`/discover`, `/friends`, `/side`) with optimized population.
7. **Environment templates** (`.env.example`) and README documentation.
8. **User schema avatar field** for richer feed/profile display.
9. **GitHub main branch** updated with all features and env tooling.

### ⚠️ Notes & Considerations
- Gemini and Google APIs are optional but recommended for full experience.
- MapView UI is presently disabled while the discovery experience is rebuilt.
- Ensure `.env` files are created locally and in deployment environments (never commit secrets).
- Frontend defaults to port 8080 (Vite) to avoid macOS ControlCenter conflict on 5000.

## Local Development Workflow
1. **Backend**
```bash
cd backend
   npm install
   cp .env.example .env   # fill values
   npm run dev             # http://localhost:5001
```
2. **Frontend**
```bash
cd frontend
   npm install
   cp .env.example .env    # fill values
   npm run dev             # http://localhost:8080
   ```
3. **Login / Registration** via `/login` or `/register` (token stored in localStorage).

## Testing Snapshot
- ✅ Backend endpoints manually verified (auth, posts, comments, feeds, AI mock path).
- ✅ Theme switching verified on side toggles (login/register/profile switch).
- ✅ AI Barista export flows tested (PDF/Markdown/clipboard).
- ⚠️ MapView relies on browser geolocation; verify HTTPS in production.
- ⚠️ Full end-to-end regression (likes/comments with new feeds) recommended before release.

## Deployment Guide (Recommended Setup)
- **Backend** → Render.com (Web Service)
  - Commands: `cd backend && npm install` (build) / `cd backend && npm start`
  - Env vars: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, optional `GEMINI_API_KEY`
- **Frontend** → Vercel (root `frontend/`)
  - Env vars: `VITE_API_BASE_URL`, optional `VITE_GOOGLE_MAPS_API_KEY`
- Ensure CORS `FRONTEND_URL` matches deployed frontend URL.

## Core Security Measures
- Bcrypt-hashed passwords
- JWT auth with 2-day token expiry
- Helmet & CORS middleware
- Auth middleware on protected routes
- Secrets stored exclusively in environment variables

## Database Models (Highlights)
- **User**: username, email, passwordHash, side, avatar, friends, friend requests, points/badges.
- **Post**: user reference, title, description, imageUrl, side, likes, timestamps.
- **Comment**: post reference, user reference, text, timestamps.

## Next Opportunities
1. Integrate **AI voice input / mood selector** for Barista.
2. Enhance **MapView** with saved favorites and richer map UI.
3. Add **feed pagination/infinite scroll** and caching via React Query.
4. Expand **testing coverage** (unit + integration) for new features.
5. Implement **share-to-feed** capability for AI-generated recipes.
6. **Image Upload System** – extend metadata (alt text, cropping) and CDN support for uploaded assets.

## Key References
- **Repository:** https://github.com/SUMMERxKx/brewbook-corner.git
- **Backend Health:** `GET http://localhost:5001/api/health`
- **Environment Templates:** `backend/.env.example`, `frontend/.env.example`

BrewBook is now feature-rich, context-driven, and ready for further polish or deployment.
