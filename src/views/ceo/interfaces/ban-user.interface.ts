import type { User } from '@/interfaces/groups.interface'

export interface BanUserModalProps {
  modelValue: boolean
  user: User | null
  groupId: number | null
}

export interface BanUserEmitData {
  userId: number
  groupId: number
  banReason: string
}

export interface BanUserModalEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'ban', data: BanUserEmitData): void
}