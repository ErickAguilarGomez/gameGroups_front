import backendApi from '@/api/backendApi'

/**
 * Servicios del módulo Assistant
 * Gestión de usuarios, analytics, configuración, etc.
 */
export const assistantServices = {
  // ========================================
  // Gestión de Usuarios
  // ========================================

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(params: object = {}): Promise<any> {
    return await backendApi.get('/api/users', { params })
  },

  /**
   * Obtener usuarios conectados
   */
  async getConnectedUsers(minutes: number = 5): Promise<any> {
    return await backendApi.get('/api/users/connected', { params: { minutes } })
  },

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: number): Promise<any> {
    return await backendApi.get(`/api/users/${id}`)
  },

  /**
   * Actualizar un usuario
   */
  async updateUser(id: number, data: object): Promise<any> {
    return await backendApi.put(`/api/users/${id}`, data)
  },

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: number): Promise<any> {
    return await backendApi.delete(`/api/users/${id}`)
  },

  // ========================================
  // Revisión de Fotos
  // ========================================

  /**
   * Obtener fotos pendientes de revisión
   */
  async getPendingPhotos(): Promise<any> {
    return await backendApi.get('/api/photos/pending')
  },

  /**
   * Aprobar foto de usuario
   */
  async approvePhoto(userId: number): Promise<any> {
    return await backendApi.post(`/api/photos/${userId}/approve`)
  },

  /**
   * Rechazar foto de usuario
   */
  async rejectPhoto(userId: number, reason?: string): Promise<any> {
    return await backendApi.post(`/api/photos/${userId}/reject`, { reason })
  },

  /**
   * Obtener estadísticas de fotos
   */
  async getPhotoStats(): Promise<any> {
    return await backendApi.get('/api/photos/stats')
  },

  // ========================================
  // Revisión de Registros
  // ========================================

  /**
   * Obtener solicitudes de registro pendientes
   */
  async getPendingRegistrations(): Promise<any> {
    return await backendApi.get('/api/registrations/pending')
  },

  /**
   * Aprobar registro de usuario
   */
  async approveRegistration(userId: number, photoDecision: 'approve' | 'reject' = 'approve'): Promise<any> {
    return await backendApi.post(`/api/registrations/${userId}/approve`, { photo_decision: photoDecision })
  },

  /**
   * Rechazar registro de usuario
   */
  async rejectRegistration(userId: number, reason?: string): Promise<any> {
    return await backendApi.post(`/api/registrations/${userId}/reject`, { reason })
  },

  /**
   * Obtener estadísticas de registros
   */
  async getRegistrationStats(): Promise<any> {
    return await backendApi.get('/api/registrations/stats')
  },
}