import { users } from '@/api/backendApi'

export const userService = {
  async getAll(): Promise<any> {
    return await users.all()
  },

  async getConnected(): Promise<any> {
    return await users.connected()
  },

  async getById(id: number): Promise<any> {
    return await users.show(id)
  },

  async update(id: number, data: object): Promise<any> {
    return await users.update(id, data)
  },

  async delete(id: number): Promise<any> {
    return await users.destroy(id)
  },
}
