export interface User {
  _id: string;
  username: string;
  email: string;
  points: number;
  questionsAsked: string[];
  answersGiven: string[];
  createdAt: string;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  answers: Answer[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  _id: string;
  content: string;
  author: User;
  question: string;
  isAccepted: boolean;
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User | string;
  parentId: string; // Can be questionId or answerId
  parentType: 'question' | 'answer';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'answer' | 'upvote' | 'comment' | 'follow' | 'mention';
  sender: User | string;
  recipient: User | string;
  entityId: string; // ID of the related entity (question, answer, etc.)
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}