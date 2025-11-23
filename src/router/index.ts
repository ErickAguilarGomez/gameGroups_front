import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Importar rutas de módulos
import ceoRoutes from '@/views/ceo/routes/index'
import userRoutes from '@/views/user/routes/index'
import assistantRoutes from '@/views/assistant/routes/index'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  
  // Rutas de CEO (Admin)
  ...ceoRoutes,
  
  // Rutas de Assistant
  ...assistantRoutes,
  
  // Rutas de Usuario
  ...userRoutes,
  
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global de autenticación
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Si va a login/register, verificar primero si hay sesión activa
  if (to.name === 'Login' || to.name === 'Register') {
    // Si ya está autenticado en el store, redirigir
    if (authStore.isAuthenticated) {
      const redirectRoute = authStore.isAdmin ? 'CeoUsers' : authStore.isAssistant ? 'AssistantUsers' : 'UserGroups'
      return next({ name: redirectRoute })
    }
    
    // Si no está autenticado en el store, verificar en el backend
    // (puede tener sesión activa pero el store no está cargado)
    await authStore.fetchUser()
    
    // Después de verificar con el backend, si está autenticado, redirigir
    if (authStore.isAuthenticated) {
      const redirectRoute = authStore.isAdmin ? 'CeoUsers' : authStore.isAssistant ? 'AssistantUsers' : 'UserGroups'
      return next({ name: redirectRoute })
    }
    
    // Si no está autenticado, permitir acceso a login/register
    return next()
  }
  
  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth !== false) {
    // Si no está autenticado, intentar obtener usuario
    if (!authStore.isAuthenticated) {
      await authStore.fetchUser()
      
      // Si después de fetchUser sigue sin estar autenticado, redirigir a login
      if (!authStore.isAuthenticated) {
        return next({ name: 'Login' })
      }
    }
    
    // Verificar permisos por rol
    if (to.meta.requiresAdmin && !authStore.isAdminOrAssistant) {
      return next({ name: 'UserGroups' })
    }
    
    if (to.meta.requiresAssistant && !authStore.isAssistant) {
      return next({ name: 'UserGroups' })
    }
    
    if (to.meta.requiresUser && authStore.isAdminOrAssistant) {
      return next({ name: 'CeoUsers' })
    }
  }
  
  next()
})

export default router
