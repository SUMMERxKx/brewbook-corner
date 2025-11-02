# Local Testing Status

## ✅ Setup Complete

1. **Dependencies Installed:**
   - ✅ Backend: npm install completed (209 packages)
   - ✅ Frontend: npm install completed (407 packages)

2. **Environment Files Created:**
   - ✅ Backend `.env` created with placeholder MongoDB URI
   - ✅ Frontend `.env` created with `VITE_API_BASE_URL=http://localhost:5000`

3. **Servers Started:**
   - ✅ Backend: nodemon running (process detected)
   - ✅ Frontend: Vite dev server running (process detected)

## ⚠️ Important Notes

### MongoDB Connection Required

The backend `.env` file contains a **placeholder MongoDB URI**:
```
MONGO_URI=mongodb+srv://test:test@cluster0.example.mongodb.net/brewbook?retryWrites=true&w=majority
```

**You need to update this with your actual MongoDB Atlas connection string** for the backend to fully function.

### Port 5000 Conflict

Port 5000 appears to be in use by another service (possibly AirTunes on macOS). If the backend doesn't start on port 5000, you may need to:

1. Change the PORT in `backend/.env` to a different port (e.g., 5001)
2. Update `frontend/.env` to match the new port
3. Or stop the service using port 5000

## 🧪 Testing Steps

### 1. Verify Backend is Running

```bash
# Check if backend responds
curl http://localhost:5000/api/health

# Should return: {"message":"BrewBook API is running","status":"ok"}
```

### 2. Verify Frontend is Running

```bash
# Open in browser
open http://localhost:5173

# Or check with curl
curl http://localhost:5173
```

### 3. Test API Endpoints

```bash
# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "side": "coffee"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 🔧 Troubleshooting

### Backend won't start:
1. Check MongoDB URI is correct in `backend/.env`
2. Check if port 5000 is available or change to another port
3. Check backend logs: `cd backend && npm run dev`

### Frontend won't connect:
1. Verify `VITE_API_BASE_URL` in `frontend/.env` matches backend port
2. Check if backend is running and accessible
3. Check CORS settings in `backend/server.js`

### MongoDB Connection Issues:
1. Verify MongoDB Atlas connection string
2. Check MongoDB Atlas network access (allow all IPs or your IP)
3. Verify database user credentials

## 📋 Next Steps

1. **Update MongoDB URI** in `backend/.env` with your actual connection string
2. **Test backend** with curl or Postman
3. **Open frontend** in browser at `http://localhost:5173`
4. **Register a user** and test the full flow
5. **Create posts** and verify database persistence

## 🚀 Quick Test Command

```bash
# Test backend health (should work even without MongoDB)
curl http://localhost:5000/api/health

# Test frontend (should return HTML)
curl http://localhost:5173 | head -20
```

