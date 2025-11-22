export interface SocialNetwork {
  id: number
  name: string
  logo_url: string
}

export interface User {
  id: number
  name: string
  email: string
  photo_url?: string | null
  photo_status?: string
  nickname?: string | null
  birthdate?: string | null
  group_id?: number | null
  account_status?: string
  created_at?: string
  social_network?: SocialNetwork | null
  social_network_id?: number | null
  banned_at?: string | null
  ban_reason?: string | null
  banned_by?: number | null
  role?: string
  role_id?: number
  last_seen?: string | null
}

export interface Group {
  id: number
  name: string
  group_img_url: string | null
  users_count?: number
  users?: User[]
}
