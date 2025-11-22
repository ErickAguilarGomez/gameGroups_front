import Swal from 'sweetalert2'
import { AlertOptions } from '@/interfaces'


export function useAlert(): AlertOptions {
  
  const success = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#667eea',
      timer: 3000,
      timerProgressBar: true
    })
  }


  const error = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#667eea'
    })
  }


  const warning = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#667eea'
    })
  }

  const info = (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#667eea'
    })
  }


  const confirm = (
    title = '¿Estás seguro?',
    text = 'Esta acción no se puede revertir',
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar'
  ) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true
    })
  }

  const confirmDelete = (itemName = 'este elemento') => {
    return Swal.fire({
      title: '¿Eliminar?',
      text: `¿Deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })
  }


  const toast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success', timer: number = 3000) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    return Toast.fire({
      icon,
      title
    })
  }

  const loading = (title: string = 'Cargando...') => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  const close = () => {
    Swal.close()
  }

  const custom = (options: any) => {
    return Swal.fire({
      confirmButtonColor: '#667eea',
      ...options
    })
  }

  const input = async (title: string, placeholder: string = '', inputValue: string = '') => {
    return Swal.fire({
      title,
      input: 'text',
      inputPlaceholder: placeholder,
      inputValue,
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Este campo es requerido'
        }
      }
    })
  }

  const textarea = async (title: string, placeholder: string = '') => {
    return Swal.fire({
      title,
      input: 'textarea',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Este campo es requerido'
        }
      }
    })
  }

  return {
    success,
    error,
    warning,
    info,
    confirm,
    confirmDelete,
    toast,
    loading,
    close,
    custom,
    input,
    textarea,
    Swal
  }
}
