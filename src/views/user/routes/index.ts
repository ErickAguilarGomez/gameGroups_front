// Rutas del módulo User
export default [
  {
    path: '/user',
    name: 'UserLayout',
    component: () => import('@/views/user/UserDashboard.vue'),
    meta: { 
      requiresAuth: true,
      requiresUser: true 
    },
    children: [
      {
        path: '',
        name: 'UserDashboard',
        redirect: { name: 'UserGroups' }
      },
      {
        path: 'groups',
        name: 'UserGroups',
        component: () => import('@/components/Groups.vue'),
        meta: { title: 'Grupos' }
      }
    ]
  }
]
