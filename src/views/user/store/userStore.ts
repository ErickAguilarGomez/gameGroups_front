import { defineStore } from 'pinia'
import { users, cloudinary } from '@/api/backendApi'
import type { User } from '@/interfaces/models'

interface UserState {
  loading: boolean
  uploading: boolean
  error: string | null
}

interface UpdateProfileData {
  name?: string
  nickname?: string
  birthdate?: string
  photo_url?: string
  social_network_id?: number | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    loading: false,
    uploading: false,
    error: null,
  }),

  getters: {
    isLoading: (state): boolean => state.loading,
    isUploading: (state): boolean => state.uploading,
    currentError: (state): string | null => state.error,
  },

  actions: {
    async uploadPhoto(file: File): Promise<string | null> {
      this.uploading = true
      this.error = null

      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('Solo se permiten archivos de imagen')
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('La imagen no debe superar los 5MB')
        }

        const signatureResponse = await cloudinary.getSignature('user_photos')
        const { signature, timestamp, api_key, cloud_name, folder } = signatureResponse.data

        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', api_key)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('folder', folder)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error('Error al subir la imagen')
        }

        const data = await response.json()
        return data.secure_url
      } catch (error: any) {
        this.error = error.message || 'Error al subir la imagen a Cloudinary'
        console.error('Cloudinary upload error:', error)
        return null
      } finally {
        this.uploading = false
      }
    },

    async updateProfile(profileData: UpdateProfileData): Promise<{ success: boolean; user?: User; error?: string }> {
      this.loading = true
      this.error = null

      try {
        const response = await users.updateProfile(profileData)
        const updatedUser = response.data as User

        return { success: true, user: updatedUser }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    clearError(): void {
      this.error = null
    },

    reset(): void {
      this.loading = false
      this.uploading = false
      this.error = null
    },
  },
})
