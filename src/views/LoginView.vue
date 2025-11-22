<template>
  <div class="login-view">
    <div class="login-container">
      <b-card class="login-card shadow-lg">
        <b-card-body>
          <!-- Logo/Title -->
          <div class="text-center mb-4">
            <div class="login-icon mb-3">
              <IconUserCircle :size="60" :stroke-width="1.5" />
            </div>
            <h2 class="fw-bold">Iniciar Sesión</h2>
            <p class="text-muted">Ingresa tus credenciales para continuar</p>
          </div>

          <!-- Form -->
          <b-form @submit.prevent="handleSubmit">
            <!-- Email -->
            <b-form-group label="Correo Electrónico" label-for="email" class="mb-3">
              <b-input-group>
                <template #prepend>
                  <b-input-group-text>
                    <IconMail :size="20" />
                  </b-input-group-text>
                </template>
                <b-form-input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  size="lg"
                />
              </b-input-group>
            </b-form-group>

            <!-- Password -->
            <b-form-group label="Contraseña" label-for="password" class="mb-3">
              <b-input-group>
                <template #prepend>
                  <b-input-group-text>
                    <IconLock :size="20" />
                  </b-input-group-text>
                </template>
                <b-form-input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Tu contraseña"
                  required
                  size="lg"
                />
                <template #append>
                  <b-button variant="outline-secondary" @click="showPassword = !showPassword">
                    <IconEye v-if="!showPassword" :size="20" />
                    <IconEyeOff v-else :size="20" />
                  </b-button>
                </template>
              </b-input-group>
            </b-form-group>

            <!-- Error Alert -->
            <b-alert v-if="error" variant="danger" show dismissible @dismissed="error = null" class="mb-3">
              <IconAlertCircle :size="20" class="me-2" />
              {{ error }}
            </b-alert>

            <!-- Submit Button -->
            <b-button
              type="submit"
              variant="primary"
              size="lg"
              class="w-100 mb-3"
              :disabled="loading"
            >
              <b-spinner v-if="loading" small class="me-2" />
              <IconLogin :size="20" class="me-2" v-if="!loading" />
              {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
            </b-button>

            <!-- Register Link -->
            <div class="text-center">
              <p class="text-muted mb-0">
                ¿No tienes cuenta? 
                <router-link to="/register" class="text-decoration-none fw-semibold">
                  Regístrate aquí
                </router-link>
              </p>
            </div>
          </b-form>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAdmin,isAssistant } = storeToRefs(authStore)

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true

  const result = await authStore.login(email.value, password.value)

  loading.value = false

  if (result.success) {
    let redirectRoute = null
    if(isAssistant.value){
      redirectRoute = '/ceo/users'
    }else if(isAdmin.value){
      redirectRoute = '/ceo/users'
    }else{
      redirectRoute = '/user/groups'
    }
    router.push(redirectRoute)
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 500px;
}

.login-card {
  width: 100%;
  border: none;
  border-radius: 20px;
}

.login-icon {
  color: #667eea;
}

:deep(.form-label) {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

:deep(.input-group-text) {
  background-color: #f8f9fa;
  border-right: none;
  padding: 0.75rem 1rem;
}

:deep(.form-control) {
  border-left: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

:deep(.form-control:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

:deep(.btn-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 600;
  transition: transform 0.2s;
  padding: 0.75rem;
  font-size: 1.1rem;
}

:deep(.btn-primary:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

:deep(.btn-primary:disabled) {
  opacity: 0.7;
}

a {
  color: #667eea;
  transition: color 0.2s;
}

a:hover {
  color: #764ba2;
}
</style>
