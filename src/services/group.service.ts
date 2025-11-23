import backendApi from "@/api/backendApi";

export const groupService = {
  async getAllGroups(): Promise<any> {
    const response = await backendApi.get("/api/groups/all-groups");
    return response.data;
  },

  async showUserDetail(id: number): Promise<any> {
    const response = await backendApi.get(`/api/groups/user-detail/${id}`);
    return response.data;
  },
};
