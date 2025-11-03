export type Side = 'coffee' | 'tea';

export interface User {
  _id: string;
  username: string;
  email: string;
  side: Side;
  avatar?: string;
  bio?: string;
  points?: number;
  badges?: string[];
  friendsCount?: number;
  postsCount?: number;
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
  userId?: string; // User ID for ownership checks
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

export type RelationType = 'none' | 'friends' | 'pending_sent' | 'pending_received';

export interface UserProfile {
  _id: string;
  username: string;
  email?: string; // Optional - hidden from public profiles
  side: Side;
  bio: string;
  points: number;
  badges: string[];
  postsCount: number;
  friendsCount: number;
  createdAt: string;
  isOwnProfile: boolean;
  isFriend?: boolean;
  relation?: RelationType;
}

export interface Notification {
  _id: string;
  sender: {
    _id: string;
    username: string;
    side: Side;
  };
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept';
  message: string;
  read: boolean;
  postId?: string;
  postTitle?: string;
  createdAt: string;
}

export interface SearchUser {
  _id: string;
  username: string;
  side: Side;
  badges: string[];
  points: number;
}

export interface Chat {
  _id: string;
  members: User[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  senderName?: string;
  text: string;
  createdAt: string;
}

export interface ChatListItem {
  _id: string;
  otherMember: User | null;
  lastMessage: {
    text: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
