export interface User {
  id: number;
  name: string;
  email?: string;
  photo_url?: string | null;
  photo_status?: string;
  nickname?: string | null;
  birthdate?: string | null;
  group_id?: number | null;
  account_status?: string;
  created_at?: string;
  social_network_name?: string | null;
  logo_url?: string | null;
  banned_at?: string | null;
  ban_reason?: string | null;
  banned_by?: number | null;
  country?: string;
  country_slug?: string;
}

export interface Group {
  id: number;
  name: string;
  group_img_url: string | null;
  users?: User[];
}

export interface AllGroupsResponse {
  users_without_group: User[];
  users_banned: User[];
  groups_with_users: {
    id: number;
    name: string;
    group_img_url?: string | null;
    users: User[];
    users_count: number;
  }[];
}

export interface UserDetailModalProps {
  modelValue: boolean;
  user: User | null;
}

export interface UserDetailModalEmits {
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}
