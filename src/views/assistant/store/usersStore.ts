import { defineStore } from 'pinia'
import { assistantServices } from '../services'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  photo_url?: string | null
  group_id?: number | null
  last_seen?: string | null
  created_at?: string
  updated_at?: string
}

interface UsersState {
  users: User[]
  connectedUsers: User[]
  loading: boolean
  error: string | null
}

export const useAssistantUsersStore = defineStore('assistant-users', {
  state: (): UsersState => ({
    users: [],
    connectedUsers: [],
    loading: false,
    error: null,
  }),

  getters: {
    allUsers: (state): User[] => state.users,
    totalUsers: (state): number => state.users.length,
    adminUsers: (state): User[] => state.users.filter(u => u.role === 'admin'),
    regularUsers: (state): User[] => state.users.filter(u => u.role === 'user'),
    totalConnected: (state): number => state.connectedUsers.length,
    isLoading: (state): boolean => state.loading,
    currentError: (state): string | null => state.error,
  },

  actions: {
    async fetchAll(params: object = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await assistantServices.getAllUsers(params)
        this.users = response.data
        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener usuarios'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchConnected(minutes: number = 5) {
      this.loading = true
      this.error = null

      try {
        const response = await assistantServices.getConnectedUsers(minutes)
        this.connectedUsers = response.data
        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener usuarios conectados'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await assistantServices.getUserById(id)
        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener usuario'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateUser(id: number, data: Partial<User>) {
      this.loading = true
      this.error = null

      try {
        const response = await assistantServices.updateUser(id, data)
        // Actualizar en el state
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...response.data }
        }
        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar usuario'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id: number) {
      this.loading = true
      this.error = null

      try {
        await assistantServices.deleteUser(id)
        // Remover del state
        this.users = this.users.filter(u => u.id !== id)
        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar usuario'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.users = []
      this.connectedUsers = []
      this.loading = false
      this.error = null
    },
  },
})