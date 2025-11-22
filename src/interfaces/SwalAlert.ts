import Swal from 'sweetalert2'

export interface AlertOptions{
  success: (title: string, text?: string) => Promise<any>
  error: (title: string, text?: string) => Promise<any>
  warning: (title: string, text?: string) => Promise<any>
  info: (title: string, text?: string) => Promise<any>
  confirm: (
    title?: string,
    text?: string,
    confirmButtonText?: string,
    cancelButtonText?: string
  ) => Promise<any>
  confirmDelete: (itemName?: string) => Promise<any>
  toast: (title: string, icon?: 'success' | 'error' | 'warning' | 'info', timer?: number) => Promise<any>
  loading: (title?: string) => void
  close: () => void
  custom: (options: any) => Promise<any>
  input: (title: string, placeholder?: string, inputValue?: string) => Promise<any>
  textarea: (title: string, placeholder?: string) => Promise<any>
  Swal: typeof Swal
}
