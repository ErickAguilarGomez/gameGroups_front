import { auth } from '@/api/backendApi'

export const authService = {
  async getCsrfCookie(): Promise<any> {
    return await auth.csrf()
  },

  async login(email: string, password: string): Promise<any> {
    return await auth.login(email, password)
  },

  async logout(): Promise<any> {
    return await auth.logout()
  },

  async getCurrentUser(): Promise<any> {
    return await auth.me()
  },
}
