import backendApi from "@/api/backendApi";

export const announcementService = {
  async getAnnouncements(params: object) {
    try {
      const response = await backendApi.post("/api/announcements", params);
      return response.data;
    } catch (error) {
      console.error("Error al obtener anuncios:", error);
      throw error;
    }
  },

  async createAnnouncement(announcementData: FormData | object) {
    try {
      const response = await backendApi.post(
        "/api/announcements/store",
        announcementData
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear anuncio:", error);
      throw error;
    }
  },

  async updateAnnouncement(announcementData: FormData | object) {
    try {
      const response = await backendApi.patch(
        `/api/announcements/update`,
        announcementData
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar anuncio:", error);
      throw error;
    }
  },

  async deleteAnnouncement(params: { id: number }) {
    try {
      const response = await backendApi.post(
        `/api/announcements/destroy`,
        params
      );
      return response.data;
    } catch (error) {
      console.error("Error al eliminar anuncio:", error);
      throw error;
    }
  },

  async showAnnouncement(params: { id: number }) {
    try {
      const response = await backendApi.post(`/api/announcements/show`, params);
      return response.data;
    } catch (error) {
      console.error("Error al mostrar anuncio:", error);
      throw error;
    }
  },
};
