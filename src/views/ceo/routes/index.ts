export default [
  {
    path: "/ceo",
    name: "CeoLayout",
    component: () => import("@/views/ceo/CeoDashboard.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    redirect: { name: "CeoUsers" },
    children: [
      {
        path: "users",
        name: "CeoUsers",
        component: () => import("@/views/ceo/views/Users.vue"),
        meta: { title: "Gestión de Usuarios" },
      },
      {
        path: "groups",
        name: "CeoGroups",
        component: () => import("@/components/Groups.vue"),
        meta: { title: "Gestión de Grupos" },
      },
      {
        path: "announcement-management",
        name: "CeoAnnouncement",
        component: () =>
          import("@/views/ceo/views/announcement/Announceent.vue"),
        meta: { title: "Gestión de Anuncios" },
      },
      {
        path: "announcement",
        name: "CeoAnnouncementView",
        component: () => import("@/components/AnnouncementSection.vue"),
        meta: { title: "Anuncios" },
      },
    ],
  },
];
