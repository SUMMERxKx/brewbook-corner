# BrewBook - Recipe Sharing App

A full-stack recipe sharing application where users pick a side (coffee or tea) and share recipes with pictures and comments.

## 🚀 Tech Stack

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn-ui** - UI components
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
brewbook/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── postController.js  # Post CRUD
│   │   └── commentController.js # Comment CRUD
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Post.js            # Post schema
│   │   └── Comment.js         # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── postRoutes.js      # Post endpoints
│   │   └── commentRoutes.js   # Comment endpoints
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context
│   │   └── types/            # TypeScript types
│   ├── public/
│   ├── package.json
│   └── .env                  # Environment variables
└── README.md
```

## 🔧 Local Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=supersecretkey
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Replace `MONGO_URI`** with your MongoDB Atlas connection string

5. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** at `http://localhost:5173`

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts (optional `?side=coffee` or `?side=tea` filter)
- `GET /api/posts/:id` - Get a single post by ID
- `POST /api/posts` - Create a new post (requires authentication)
- `POST /api/posts/:id/like` - Like/unlike a post (requires authentication)

### Comments
- `POST /api/posts/:id/comments` - Add a comment to a post (requires authentication)
- `GET /api/comments/:postId` - Get all comments for a post

### Authentication
Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 🚢 Deployment

### Option A: Separate Deployment (Recommended)

#### Backend on Render
1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas URI
   - `JWT_SECRET` - A secure random string
   - `NODE_ENV=production`
   - `FRONTEND_URL` - Your frontend URL (e.g., `https://your-app.vercel.app`)

#### Frontend on Vercel
1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL` - Your backend URL (e.g., `https://your-backend.onrender.com`)
5. Deploy

### Option B: Combined Deployment (Single App)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy backend to Render** (includes built frontend):
   - Build command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
   - Start command: `cd backend && npm start`
   - Set `NODE_ENV=production` in environment variables

3. The backend will serve the frontend static files automatically in production mode.

## 🧪 Testing

### API Testing with Postman

1. **Register a user:**
   ```
   POST http://localhost:5000/api/auth/register
   Body (JSON):
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "side": "coffee"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Create a post** (use token from login):
   ```
   POST http://localhost:5000/api/posts
   Headers:
   Authorization: Bearer <your_token>
   Body (JSON):
   {
     "title": "Cappuccino",
     "description": "Classic Italian coffee",
     "imageUrl": "https://example.com/image.jpg",
     "side": "coffee"
   }
   ```

### Frontend Testing Checklist

- ✅ Register/Login → Token stored in localStorage
- ✅ Feed loads posts from `/api/posts`
- ✅ Create Post form sends `POST /api/posts`
- ✅ Comments load from `/api/comments/:postId`
- ✅ Likes persist after page refresh
- ✅ Images display correctly
- ✅ Token expiry after ~2 days

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth (2-day expiry)
- ✅ **bcrypt Password Hashing** - Passwords never stored in plaintext
- ✅ **Helmet** - Security headers
- ✅ **CORS** - Configured for frontend origin
- ✅ **Input Validation** - All endpoints validate required fields
- ✅ **Environment Variables** - Sensitive data in `.env` files

## 📝 Features

- 🍵 Pick a side: Coffee or Tea
- 📝 Create and share recipes
- 🖼️ Upload images for recipes
- ❤️ Like posts
- 💬 Comment on posts
- 🔐 Secure authentication
- 📱 Responsive design

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that frontend `.env` has correct `VITE_API_BASE_URL`

### MongoDB Connection Issues
- Verify your `MONGO_URI` is correct
- Check MongoDB Atlas network access allows your IP
- Ensure database user has proper permissions

### Authentication Errors
- Verify JWT token is included in Authorization header
- Check token hasn't expired (2 days)
- Ensure `JWT_SECRET` matches between deployments

## 📄 License

ISC

## 👥 Contributing

Contributions welcome! Please open an issue or submit a pull request.
