import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for Render free tier
  headers: {
    'Content-Type': 'application/json',
  },
});

const FIELD_LABELS: Record<string, string> = {
  name: 'name',
  age: 'age',
  email: 'email',
  password: 'password',
  phone: 'phone number',
  street: 'street address',
  city: 'city',
  state: 'state',
  zip: 'ZIP code',
  country: 'country',
};

function fieldFromLoc(loc: unknown): string {
  if (!Array.isArray(loc) || loc.length === 0) {
    return 'this field';
  }
  const parts = loc.filter((part) => part !== 'body' && part !== 'query' && part !== 'path');
  const key = String(parts[parts.length - 1] ?? loc[loc.length - 1]);
  return FIELD_LABELS[key] || key.replace(/_/g, ' ');
}

function formatValidationItem(item: unknown): string {
  if (typeof item === 'string') {
    return item;
  }
  if (!item || typeof item !== 'object') {
    return '';
  }

  const err = item as { loc?: unknown; msg?: string; type?: string; ctx?: { reason?: string } };
  const field = fieldFromLoc(err.loc);
  const errType = err.type || '';
  const msg = (err.msg || 'is invalid').trim();
  const reason = err.ctx?.reason;

  if (field === 'email' || errType.includes('email')) {
    const extra = reason ? ` ${reason}` : '';
    return `Please enter a valid email address (accounts use email, not a username).${extra}`;
  }
  if (field === 'age' || errType.includes('int')) {
    return 'Age must be a whole number between 18 and 120.';
  }
  if (field === 'password') {
    if (errType.includes('max') || msg.includes('72')) {
      return 'Password cannot be longer than 72 characters.';
    }
    if (errType.includes('min') || msg.includes('6')) {
      return 'Password must be at least 6 characters long.';
    }
    return `Password is invalid: ${msg}`;
  }
  if (field === 'name') {
    return 'Please enter your name.';
  }
  if (errType.includes('missing')) {
    return `${field.charAt(0).toUpperCase()}${field.slice(1)} is required.`;
  }
  return `${field.charAt(0).toUpperCase()}${field.slice(1)} ${msg.charAt(0).toLowerCase()}${msg.slice(1)}.`;
}

function formatDetail(detail: unknown): string | null {
  if (detail == null) {
    return null;
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail.map(formatValidationItem).filter(Boolean);
    return parts.length
      ? Array.from(new Set(parts)).join(' ')
      : 'Some of the information you entered is not valid. Please review the form and try again.';
  }
  if (typeof detail === 'object') {
    const asRecord = detail as { msg?: string; message?: string };
    if (asRecord.msg || asRecord.message) {
      return asRecord.msg || asRecord.message || null;
    }
  }
  return null;
}

function mapKnownDetail(detail: string): string {
  const lower = detail.toLowerCase();
  if (lower.includes('email already registered')) {
    return 'This email is already registered. Try logging in instead, or use a different email.';
  }
  if (lower.includes('incorrect email or password')) {
    return 'Invalid email or password. Check your credentials, or register if you do not have an account yet.';
  }
  if (lower.includes('password cannot be longer than 72')) {
    return 'Password is too long. Please use 72 characters or less.';
  }
  if (lower.includes('invalid email')) {
    return 'Please enter a valid email address. Accounts are created with email, not a username.';
  }
  if (lower.includes('age must be')) {
    return 'Age must be between 18 and 120 years.';
  }
  if (lower.includes('name is required')) {
    return 'Name is required.';
  }
  if (lower.includes('password is required')) {
    return 'Password is required.';
  }
  if (lower.includes('email is required')) {
    return 'Email is required.';
  }
  if (lower.includes('could not validate credentials')) {
    return 'Your session is invalid or has expired. Please log in again.';
  }
  if (lower.includes('not enough permissions')) {
    return 'Access denied. Your account does not have permission for this action.';
  }
  return detail;
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The server could not process this request. Check the information you entered and try again.';
    case 401:
      return 'You need to be logged in to do that. Please sign in and try again.';
    case 403:
      return 'Access denied. Your account does not have permission for this action.';
    case 404:
      return 'That service or page was not found. The API URL may be misconfigured, or the endpoint may have moved.';
    case 408:
    case 504:
      return 'The request timed out. The server may still be waking up — wait a few seconds and try again.';
    case 409:
      return 'This conflicts with an existing record. If you are registering, that email may already be in use.';
    case 422:
      return 'Some of the information you entered is not valid. Check your name, email, age (18–120), and password (6–72 characters).';
    case 429:
      return 'Too many attempts. Please wait a minute and try again.';
    case 500:
    case 502:
      return 'The server hit an unexpected problem. Please wait a moment and try again. If this keeps happening, the API may be restarting.';
    case 503:
      return 'The API is temporarily unavailable or still starting up (common on free hosting). Wait about 30 seconds and try again.';
    default:
      return `Something went wrong (error ${status}). Please try again. If it keeps happening, wait a moment and retry.`;
  }
}

export function getUserErrorMessage(error: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (error && typeof error === 'object' && 'userMessage' in error) {
    const userMessage = (error as { userMessage?: unknown }).userMessage;
    if (typeof userMessage === 'string' && userMessage.trim()) {
      return userMessage;
    }
  }
  return fallback;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and provide better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const requestUrl = String(error.config?.url || '');
    const isAuthAttempt = requestUrl.includes('/login') || requestUrl.includes('/register');

    // Expired sessions should return to login, but failed login/register must stay put
    // so the form can show the actual error.
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    const detailMessage = formatDetail(error.response?.data?.detail);

    if (detailMessage) {
      error.userMessage = mapKnownDetail(detailMessage);
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      error.userMessage =
        'Unable to reach the server. Check your internet connection. If you are using the live site, the API on Render may still be waking up — wait about 30 seconds and try again.';
    } else if (error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.includes('timeout'))) {
      error.userMessage =
        'The request timed out. The server is taking longer than expected (common when the API is starting). Please try again in a moment.';
    } else if (status) {
      error.userMessage = messageForStatus(status);
    } else {
      error.userMessage =
        (typeof error.message === 'string' && error.message) ||
        'An unexpected error occurred. Please try again. If it continues, refresh the page.';
    }

    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_subscribed: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  name: string;
  age: number;
  email: string;
  password: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_subscribed: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authAPI = {
  register: (userData: UserCreate): Promise<Token> =>
    api.post('/register', userData).then(res => res.data),
  
  login: (credentials: UserLogin): Promise<Token> =>
    api.post('/login', credentials).then(res => res.data),
  
  getMe: (): Promise<User> =>
    api.get('/me').then(res => res.data),
  
  getNewsletterSubscribers: (): Promise<User[]> =>
    api.get('/newsletter').then(res => res.data),
};

export default api;
