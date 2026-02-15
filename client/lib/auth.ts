import { api, setAuthToken } from './api';

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  avatarImage?: string;
  isAvatarImageSet?: boolean;
}

export const CURRENT_USER_KEY = 'chat_current_user';

export async function registerUser(email: string, username: string, password: string) {
  try {
    const { data } = await api.post('/auth/register', { email, username, password });
    if (data.status) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.msg };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.msg || 'Registration failed' };
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const { data } = await api.post('/auth/login', { username, password });
    if (data.status) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('chat_token', data.token);
        setAuthToken(data.token);
      }
      return { success: true, user: data.user };
    }
    return { success: false, error: data.msg };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.msg || 'Login failed' };
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!userStr) return null;
  const user = JSON.parse(userStr);

  // Validate essential fields
  if (!user || !user.username || (!user._id && !user.id)) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }

  const token = localStorage.getItem('chat_token');
  if (token) setAuthToken(token);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('chat_token');
  setAuthToken('');
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data } = await api.get('/users');
    return data;
  } catch (error) {
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await getAllUsers(); // Optimization: Create specific endpoint
    return users.find((u: User) => u._id === id || u.id === id) || null;
  } catch (error) {
    return null;
  }
}

export async function searchUsers(query: string, currentUserId?: string): Promise<User[]> {
  try {
    const users = await getAllUsers(); // Optimization: Backend search endpoint
    return users.filter((u: User) =>
      // Exclude current user from search results
      (u._id !== currentUserId && u.id !== currentUserId) &&
      (u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()))
    );
  } catch (error) {
    return [];
  }
}
