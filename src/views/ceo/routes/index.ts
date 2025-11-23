// Rutas del módulo CEO (Admin)
export default [
  {
    path: '/ceo',
    name: 'CeoLayout',
    component: () => import('@/views/ceo/CeoDashboard.vue'),
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    },
    redirect: { name: 'CeoUsers' },
    children: [
      {
        path: 'users',
        name: 'CeoUsers',
        component: () => import('@/views/ceo/views/Users.vue'),
        meta: { title: 'Gestión de Usuarios' }
      },
      {
        path: 'groups',
        name: 'CeoGroups',
        component: () => import('@/views/shared/components/Groups.vue'),
        meta: { title: 'Gestión de Grupos' }
      }
    ]
  }
]
