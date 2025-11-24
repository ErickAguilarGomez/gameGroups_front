<template>
  <div class="ceo-dashboard">
    <!-- Sidebar -->
    <GamerSidebar
      title="CEO Panel"
      logo-icon="IconUsers"
      :menu-items="menuItems"
      :on-logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="ceo-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
  {
    title: 'Gestión',
    items: [
      {
        name: 'users',
        label: 'Usuarios',
        icon: 'IconUsers',
        route: { name: 'CeoUsers' }
      },
      {
        name: 'groups',
        label: 'Grupos',
        icon: 'IconUsersGroup',
        route: { name: 'CeoGroups' }
      },
      {
        name: 'anuncios',
        label: 'Anuncios',
        icon: 'IconBell',
        route: { name: 'CeoAnnouncement' }
      }
    ]
  }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.ceo-dashboard {
  display: flex;
  min-height: 100vh;
  background: #0f0f23;
}

.ceo-content {
  flex: 1;
  background: #0f0f23;
  overflow-y: auto;
}
</style>
