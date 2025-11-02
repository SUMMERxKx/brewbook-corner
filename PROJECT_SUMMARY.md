# BrewBook Project Summary

## Project Overview
BrewBook is a full-stack recipe sharing application where users pick a side (coffee or tea) and share recipes with pictures and comments. The project has been restructured with separate frontend and backend directories and is ready for local testing and deployment.

## Project Structure
```
brewbook/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Registration & Login
│   │   ├── postController.js  # Posts CRUD operations
│   │   └── commentController.js # Comments operations
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT token verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Post.js            # Post schema
│   │   └── Comment.js         # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth endpoints
│   │   ├── postRoutes.js      # /api/posts endpoints
│   │   └── commentRoutes.js   # /api/comments endpoints
│   ├── server.js              # Express server setup
│   ├── package.json           # Backend dependencies
│   └── .env                   # Backend environment variables
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts        # Connected to backend API
│   │   │   ├── posts.ts       # Connected to backend API
│   │   │   └── axios.ts       # Axios instance with interceptors
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context (AuthContext)
│   │   └── types/             # TypeScript types
│   ├── package.json           # Frontend dependencies
│   └── .env                   # Frontend environment variables
│
├── README.md                   # Main documentation
├── SETUP.md                    # Quick setup guide
└── .gitignore                  # Git ignore file
```

## Technology Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database (MongoDB Atlas)
- **JWT** (jsonwebtoken) - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn-ui** - UI component library
- **Axios** - HTTP client

## Current Configuration

### Backend Environment (.env)
```
PORT=5001
MONGO_URI=mongodb+srv://brewBookUser:Testing%40123BrewBook%40123@brewbook-cluster.enchm07.mongodb.net/brewbook?retryWrites=true&w=majority
JWT_SECRET=supersecretkey_test_12345
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Note:** Port changed from 5000 to 5001 because port 5000 was occupied by macOS ControlCenter/AirTunes service.

### Frontend Environment (.env)
```
VITE_API_BASE_URL=http://localhost:5001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ username, email, password, side }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Posts
- `GET /api/posts` - Get all posts (optional `?side=coffee` or `?side=tea`)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (requires auth)
  - Body: `{ title, description, imageUrl }`
- `POST /api/posts/:id/like` - Like/unlike post (requires auth)

### Comments
- `POST /api/posts/:id/comments` - Add comment (requires auth)
  - Body: `{ text }`
- `GET /api/comments/:postId` - Get all comments for a post

## Current Status

### ✅ Completed
1. Backend API fully implemented with all endpoints
2. Frontend connected to backend (no mock data)
3. MongoDB connection configured and tested
4. User registration and login tested successfully
5. JWT authentication working
6. Security middleware (Helmet, CORS) configured
7. Project restructured with separate frontend/backend folders
8. Documentation created
9. Code pushed to GitHub: `https://github.com/SUMMERxKx/brewbook-corner.git`

### ⚠️ Current Issues/Notes
1. **Port Configuration:** Backend changed to port 5001 due to port 5000 being occupied
2. **MongoDB URI:** Password is URL-encoded (`@` becomes `%40`) in the connection string
3. **Environment Files:** `.env` files are local-only (not committed to git) and need to be created on deployment servers

## How to Run Locally

### Prerequisites
- Node.js installed
- MongoDB Atlas account with connection string configured

### Step 1: Start Backend
```bash
cd backend
npm install  # Already done
npm run dev   # Starts on http://localhost:5001
```

### Step 2: Start Frontend
```bash
cd frontend
npm install  # Already done
npm run dev   # Starts on http://localhost:5173
```

### Step 3: Open in Browser
- **Use localhost URL:** `http://localhost:5173` (NOT the network URL)
- Network URL can cause CORS issues
- Frontend is configured to connect to `http://localhost:5001` backend

## Testing Status

### ✅ Tested & Working
- MongoDB connection: ✅ Connected
- Backend health endpoint: ✅ Responding
- User registration: ✅ Working (test user created)
- User login: ✅ Working (JWT token generated)
- API endpoints: ✅ All responding

### ⏳ Not Yet Tested
- Frontend UI flow (registration, login, post creation)
- Full user journey (register → login → create post → comment → like)
- Image uploads (currently accepts imageUrl string)
- Token persistence in frontend

## Deployment Options

### Option A: Separate Deployment (Recommended)
- **Backend:** Deploy to Render.com
  - Build: `cd backend && npm install`
  - Start: `cd backend && npm start`
  - Environment variables needed:
    - `MONGO_URI` (your MongoDB Atlas URI)
    - `JWT_SECRET` (secure random string)
    - `NODE_ENV=production`
    - `FRONTEND_URL` (your Vercel URL)
  
- **Frontend:** Deploy to Vercel.com
  - Root directory: `frontend`
  - Environment variable:
    - `VITE_API_BASE_URL` (your Render backend URL)

### Option B: Combined Deployment
- Deploy only backend to Render
- Backend serves frontend static files (built in production mode)
- Requires building frontend before deployment

## Key Files & Their Purpose

### Backend
- `server.js` - Main Express server, CORS config, static file serving in production
- `authController.js` - User registration/login logic with bcrypt & JWT
- `postController.js` - Post CRUD with user population and formatting
- `commentController.js` - Comment creation and retrieval
- `authMiddleware.js` - JWT token verification for protected routes

### Frontend
- `api/auth.ts` - Authentication API calls (register/login)
- `api/posts.ts` - Posts API calls (CRUD operations)
- `api/axios.ts` - Axios instance with token interceptor
- `context/AuthContext.tsx` - Authentication state management

## Security Features Implemented
1. ✅ Password hashing with bcrypt
2. ✅ JWT tokens with 2-day expiry
3. ✅ Helmet security headers
4. ✅ CORS configuration
5. ✅ Environment variables for secrets
6. ✅ Input validation on all endpoints
7. ✅ Authentication middleware for protected routes

## Database Schema

### User
- username: String (required)
- email: String (required, unique)
- passwordHash: String (required, bcrypt hashed)
- side: String (enum: "coffee" | "tea", required)
- createdAt: Date

### Post
- userId: ObjectId (ref: User, required)
- title: String
- description: String
- imageUrl: String
- side: String (enum: "coffee" | "tea")
- likes: [ObjectId] (ref: User)
- createdAt: Date

### Comment
- postId: ObjectId (ref: Post, required)
- userId: ObjectId (ref: User, required)
- text: String (required)
- createdAt: Date

## Questions to Clarify

1. **Local Testing:** Should I use `http://localhost:5173` (localhost) or the network URL when testing? **ANSWER: Use localhost URL**

2. **Port Configuration:** Why is backend on port 5001 instead of 5000? **ANSWER: Port 5000 was occupied by macOS system service**

3. **MongoDB Password:** Why is `@` encoded as `%40` in the connection string? **ANSWER: URL encoding required for special characters in connection strings**

4. **Frontend-Backend Connection:** How does frontend connect to backend? **ANSWER: Via VITE_API_BASE_URL environment variable set to http://localhost:5001**

5. **Deployment:** What environment variables are needed for deployment? **ANSWER: See Deployment Options section above**

6. **Current State:** What's working and what needs testing? **ANSWER: Backend fully tested and working, frontend needs UI flow testing**

## Next Steps Needed
1. Test full frontend UI flow (register → login → create post → comment → like)
2. Verify token persistence and auto-logout on expiry
3. Test image URL handling
4. Prepare deployment configuration for Render/Vercel
5. Update MongoDB Atlas network access for deployment IPs

## Important URLs
- **Repository:** https://github.com/SUMMERxKx/brewbook-corner.git
- **Backend (local):** http://localhost:5001
- **Frontend (local):** http://localhost:5173
- **Backend Health Check:** http://localhost:5001/api/health

