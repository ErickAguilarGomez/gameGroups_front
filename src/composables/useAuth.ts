import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const authStore = useAuthStore();
  const state = storeToRefs(authStore);

  return {
    ...state,
    login: authStore.login,
    logout: authStore.logout,
    fetchUser: authStore.fetchUser,
    setUser: authStore.setUser,
    clearError: authStore.clearError,
    reset: authStore.reset,
  };
}
