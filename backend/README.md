# BrewBook Backend API

A simple, secure backend API for BrewBook - a recipe sharing app where users pick a side (coffee or tea) and post recipes with pictures and comments.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=supersecretkey
```

3. Replace `your_mongodb_atlas_uri` with your actual MongoDB Atlas connection string.

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

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

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt for password hashing
- dotenv for environment variables
- CORS enabled for frontend connection

