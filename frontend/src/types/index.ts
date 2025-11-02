export type Side = 'coffee' | 'tea';

export interface User {
  _id: string;
  username: string;
  email: string;
  side: Side;
  avatar?: string;
}

export interface Comment {
  _id: string;
  user: {
    username: string;
    side: Side;
  };
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  side: Side;
  user: {
    username: string;
    side: Side;
    avatar?: string;
  };
  likes: number;
  likedBy?: string[];
  comments: Comment[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  side: Side;
}

export interface CreatePostData {
  title: string;
  description: string;
  imageUrl: string;
}

export interface CreateCommentData {
  text: string;
}
