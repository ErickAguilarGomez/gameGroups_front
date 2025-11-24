export interface SocialNetwork {
  id: number;
  name: string;
  logo_url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number;
  birthdate: string | null;
  photo_status: string | null;
  photo_url: string | null;
  account_status: string;
  rejection_reason: string | null;
  photo_rejection_reason: string | null;
  created_at: string;
  nickname: string | null;
  social_network_id: number | null;
  country?: string | null;
  country_slug?: string | null;
  banned_at?: string | null;
  ban_reason?: string | null;
  banned_by?: number | null;
  last_seen?: string | null;
  group_id?: number | null;
  social_network?: SocialNetwork | null;
  group?: Group | null;
}

export interface Group {
  id: number;
  name: string;
  group_img_url: string | null;
  users_count?: number;
  users?: User[];
}
