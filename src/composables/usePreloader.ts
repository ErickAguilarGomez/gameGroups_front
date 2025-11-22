import { useAppStore } from "@/stores/appStore";

export function addPreloader() {
  const appStore = useAppStore();
  appStore.setLoading(true);
}

export function removePreloader() {
  const appStore = useAppStore();
  appStore.setLoading(false);
}

export function usePreloader() {
  return {
    addPreloader,
    removePreloader,
  };
}
