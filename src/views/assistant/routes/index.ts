// Rutas del módulo Assistant
export default [
  {
    path: '/assistant',
    name: 'AssistantLayout',
    component: () => import('@/views/assistant/AssistantDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresAssistant: true
    },
    redirect: { name: 'AssistantUsers' },
    children: [
      {
        path: 'users',
        name: 'AssistantUsers',
        component: () => import('@/views/assistant/views/Users.vue'),
        meta: { title: 'Gestión de Usuarios' }
      },
      {
        path: 'groups',
        name: 'AssistantGroups',
        component: () => import('@/views/shared/components/Groups.vue'),
        meta: { title: 'Gestión de Grupos' }
      }
    ]
  }
]