# Quick Setup Guide

## ✅ Project Structure

```
brewbook/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite App
├── .gitignore        # Ignores node_modules, .env, dist
└── README.md         # Full documentation
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file with:
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=supersecretkey
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file with:
VITE_API_BASE_URL=http://localhost:5000

# Start dev server
npm run dev
```

## 📝 Environment Variables Template

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=supersecretkey
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🔐 API Testing

Use Postman or curl to test:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123","side":"coffee"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

## 🚢 Deployment Checklist

### Backend (Render)
- [ ] Set MONGO_URI
- [ ] Set JWT_SECRET (secure random string)
- [ ] Set NODE_ENV=production
- [ ] Set FRONTEND_URL (your Vercel URL)
- [ ] Build: `cd backend && npm install`
- [ ] Start: `cd backend && npm start`

### Frontend (Vercel)
- [ ] Set VITE_API_BASE_URL (your Render URL)
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

## ✅ Features Completed

- ✅ Project restructured (frontend/backend separation)
- ✅ Security (Helmet, CORS, JWT)
- ✅ API endpoints connected
- ✅ Environment configuration
- ✅ Static file serving (combined deploy option)
- ✅ Documentation

