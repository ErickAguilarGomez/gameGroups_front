import backendApi from '@/api/backendApi'
import type { UsersByTabParams, UsersByTabResponse,UsersCounters } from '@/types/user'


export const ceoUserService = {
  async getUsersByTab(params: UsersByTabParams): Promise<UsersByTabResponse> {
    const data: any = { tab: params.tab }
    
    if (params.per_page) data.per_page = params.per_page
    if (params.page) data.page = params.page
    if (params.search) data.search = params.search
    
    const response = await backendApi.post('/api/users/by-tab', data)
    return response.data
  },

  async getCounters(): Promise<UsersCounters> {
    const response = await backendApi.get('/api/users/counters')
    return response.data
  },

  async approvePhoto(userId: number): Promise<void> {
    const params: any = { user_id: userId }
    await backendApi.post('/api/users/approve-photo', params)
  },

  async rejectPhoto(userId: number, reason: string): Promise<void> {
    const params: any = { user_id: userId, reason }
    await backendApi.post('/api/users/reject-photo', params)
  },

  async approveUser(userId: number): Promise<void> {
    const params: any = { user_id: userId }
    await backendApi.post('/api/users/approve-account', params)
  },

  async rejectUser(userId: number, reason: string): Promise<void> {
    const params: any = { user_id: userId, reason }
    await backendApi.post('/api/users/reject-account', params)
  },

  async approveUserWithPhoto(userId: number): Promise<void> {
    const params: any = { user_id: userId }
    await backendApi.post('/api/users/approve-with-photo', params)
  },

  async approveUserWithoutPhoto(userId: number): Promise<void> {
    const params: any = { user_id: userId }
    await backendApi.post('/api/users/approve-without-photo', params)
  },

  async updateUser(userId: number, data: { name?: string; email?: string; password?: string }): Promise<void> {
    const params: any = { user_id: userId, ...data }
    await backendApi.post('/api/users/update', params)
  },

  async deleteUser(userId: number): Promise<void> {
    const params: any = { user_id: userId }
    await backendApi.post('/api/users/delete', params)
  }
}
