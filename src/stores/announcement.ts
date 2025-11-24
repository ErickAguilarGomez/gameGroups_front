import { defineStore } from "pinia";
import { ref } from "vue";
import { announcementService } from "@/views/ceo/services/announcement";

interface Announcement {
  id: number | string;
  title: string;
  description: string;
  url?: string;
  is_video?: number | boolean;
  end_date?: string | null;
}

export const useAnnouncementStore = defineStore("announcement", () => {
  const announcements = ref<Announcement[]>([]);
  const loading = ref(false);

  async function fetchAnnouncements() {
    loading.value = true;
    try {
      const params = {
        status: "active",
      };
      const response: any = await announcementService.getAnnouncements(params);
      announcements.value = response;
    } catch (err) {
      console.error("announcementStore: fetchAnnouncements error", err);
      announcements.value = [];
    } finally {
      loading.value = false;
    }
  }

  function getById(id: number | string) {
    return announcements.value.find((a) => String(a.id) === String(id));
  }

  return {
    announcements,
    loading,
    fetchAnnouncements,
    getById,
  };
});
