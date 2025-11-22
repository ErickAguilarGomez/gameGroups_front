
export interface User {
  id: number
  name: string
  email: string
  role: string
  role_id: number
  birthdate: string | null
  photo_status: string | null
  photo_url: string | null
  account_status: string
  rejection_reason: string | null
  photo_rejection_reason: string | null
  created_at: string
  nickname: string | null
  social_network_id: number | null
  social_network?: {
    id: number
    name: string
    logo_url: string
  }
  group?: {
    id: number
    name: string
    group_img_url: string | null
  }
}

export interface UsersByTabParams {
  tab: number
  per_page?: number
  page?: number
  search?: string
}

export interface UsersByTabResponse {
  data: User[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export interface UsersCounters {
  activeUsers: number
  pendingPhotos: number
  rejectedUsers: number
  pendingApproval: number
}
