<template>
  <div class="dashboard-view">
    <div v-if="isLoading">Cargando...</div>
    <div v-else>
      <p>Bienvenido, {{ userName }}</p>
      <AdminPanel v-if="isAdmin || isAssistant" />
      <UserPanel v-else />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import AdminPanel from '@/components/AdminPanel.vue'
import UserPanel from '@/components/UserPanel.vue'

const authStore = useAuthStore()
const { isAdmin,isAssistant, userName, isLoading } = storeToRefs(authStore)

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}
</style>
