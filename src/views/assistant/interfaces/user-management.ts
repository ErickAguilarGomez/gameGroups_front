import type { User } from "@/interfaces";

export interface UsersByTabParams {
  tab: number;
  per_page?: number;
  page?: number;
  search?: string;
}

export interface UsersByTabResponse {
  data: User[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface UsersCounters {
  activeUsers: number;
  pendingPhotos: number;
  rejectedUsers: number;
  pendingApproval: number;
}