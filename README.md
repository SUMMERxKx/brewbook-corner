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
- **Gemini Generative AI** - AI Barista integration (optional)
- **Cloudinary** - Cloud-based image storage and optimization

## 📁 Project Structure

```
brewbook/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── postController.js  # Post CRUD
│   │   ├── commentController.js # Comment CRUD
│   │   └── aiController.js    # Gemini-powered AI Barista
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Post.js            # Post schema
│   │   └── Comment.js         # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── postRoutes.js      # Post endpoints
│   │   ├── commentRoutes.js   # Comment endpoints
│   │   ├── aiRoutes.js        # AI Barista endpoint
│   │   └── uploadRoutes.js    # Image upload endpoint
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
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and set the following variables:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:8080
   GEMINI_API_KEY=your-gemini-api-key-here  # Optional: Leave empty for mock responses
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Replace the values:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string for JWT tokens
   - `GEMINI_API_KEY` - (Optional) Get from https://aistudio.google.com/app/apikey
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Get from https://cloudinary.com/console (sign up for a free account)

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

3. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and set:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here  # Optional: Leave empty to use OpenStreetMap
   ```

4. **Replace the values:**
   - `VITE_API_BASE_URL` - Your backend URL (default: http://localhost:5001)
   - `VITE_GOOGLE_MAPS_API_KEY` - (Optional) Get from https://console.cloud.google.com/google/maps-apis

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser** at `http://localhost:8080`

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

### Uploads
- `POST /api/upload` - Upload an image for posts (requires authentication, multipart/form-data with `image` field)
  - Images are uploaded to Cloudinary and automatically optimized
  - Returns: `{ message, url, publicId }`
  - Use the returned `url` (Cloudinary secure URL) when creating a post
  - Max file size: 5MB
  - Supported formats: JPEG, PNG, WebP, GIF

### Authentication
Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```