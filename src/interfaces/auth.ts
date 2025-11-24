import type { User } from "@/interfaces/models";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string | null;
}
