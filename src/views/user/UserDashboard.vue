<template>
  <div class="user-dashboard-gamer">
    <!-- Sidebar -->
    <GamerSidebar
      title="Panel Usuario"
      logo-icon="IconUsers"
      :menu-items="menuItems"
      :on-logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="main-content-gamer">
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
    items: [
      {
        name: 'groups',
        label: 'Grupos',
        icon: 'IconUsersGroup',
        route: { name: 'UserGroups' }
      },
      {
        name: 'announcements',
        label: 'Anuncios',
        icon: 'IconMessageCircle',
        route: { name: 'UserAnnouncement' }
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
.user-dashboard-gamer {
  display: flex;
  min-height: 100vh;
  background: #0f0f23;
}

.main-content-gamer {
  flex: 1;
  background: #0f0f23;
  overflow-y: auto;
}
</style>