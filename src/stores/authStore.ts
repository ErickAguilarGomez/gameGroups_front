import { defineStore } from "pinia";
import { authService } from "@/services/authService";
import type { User, AuthState, LoginResponse } from "@/interfaces";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state): User | null => state.user,
    isLoggedIn: (state): boolean => state.isAuthenticated,
    isAdmin: (state): boolean => state.user?.role_id === 1,
    isAssistant: (state): boolean => state.user?.role_id === 3,
    isAdminOrAssistant: (state): boolean =>
      state.user?.role_id === 1 || state.user?.role_id === 3,
    canModerate: (state): boolean => state.user?.role_id === 1,
    isUser: (state): boolean => state.user?.role_id === 2,
    userName: (state): string => state.user?.name || "Usuario",
    userEmail: (state): string => state.user?.email || "",
    userRole: (state): string => state.user?.role || "guest",
    isLoading: (state): boolean => state.loading,
    currentError: (state): string | null => state.error,
  },

  actions: {
    async login(email: string, password: string): Promise<LoginResponse> {
      this.loading = true;
      this.error = null;

      try {
        await authService.getCsrfCookie();
        const response = await authService.login(email, password);
        const userData = response.data as User;
        this.user = userData;
        this.isAuthenticated = true;
        return { success: true, user: userData };
      } catch (error: any) {
        this.error = error.response?.data?.message || "Error al iniciar sesión";
        this.isAuthenticated = false;
        this.user = null;
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async logout(): Promise<LoginResponse> {
      this.loading = true;
      this.error = null;

      try {
        await authService.logout();
        this.user = null;
        this.isAuthenticated = false;
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || "Error al cerrar sesión";
        this.user = null;
        this.isAuthenticated = false;
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(): Promise<LoginResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.getCurrentUser();
        const userData = response.data as User;

        this.user = userData;
        this.isAuthenticated = true;

        return { success: true, user: userData };
      } catch (error: any) {
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;
        return { success: false };
      } finally {
        this.loading = false;
      }
    },

    setUser(userData: User | null): void {
      this.user = userData;
      this.isAuthenticated = !!userData;
    },

    clearError(): void {
      this.error = null;
    },

    reset(): void {
      this.user = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
    },
  },
});
