<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { BApp } from 'bootstrap-vue-next'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {

  try {
    await authService.getCsrfCookie()
  } catch (error) {
    console.warn('No se pudo obtener CSRF cookie:', error)
  }

  const currentRoute = router.currentRoute.value
  const isPublicRoute = currentRoute.name === 'Login' || currentRoute.name === 'Register'
  
  if (!isPublicRoute) {
    await authStore.fetchUser()
  }
})
</script>
<template>
  <BApp>
    <router-view />
  </BApp>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
