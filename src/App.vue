<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { authService } from '@/services/authService'
import Preloader from '@/components/Preloader.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()

onMounted(async () => {
  const loadingBg = document.getElementById('loading-bg')
  if (loadingBg) {
    loadingBg.remove()
  }

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
  <div>
    <Preloader :show="appStore.loading" />
    <router-view />
  </div>
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
