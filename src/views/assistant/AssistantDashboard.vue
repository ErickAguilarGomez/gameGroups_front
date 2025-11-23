<template>
  <div class="assistant-dashboard">
    <!-- Sidebar -->
    <GamerSidebar
      title="Assistant Panel"
      logo-icon="IconUsers"
      :menu-items="menuItems"
      :on-logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="assistant-content">
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
        route: { name: 'AssistantUsers' }
      },
      {
        name: 'groups',
        label: 'Grupos',
        icon: 'IconUsersGroup',
        route: { name: 'AssistantGroups' }
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
.assistant-dashboard {
  display: flex;
  height: 100vh;
}

.assistant-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>