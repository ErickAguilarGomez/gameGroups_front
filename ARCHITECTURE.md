# 🏗️ Arquitectura del Frontend

## 📂 Estructura de Capas

```
src/
├── api/              # Configuración de Axios (backendApi.js)
├── services/         # Capa de servicios (solo peticiones HTTP)
├── stores/           # Estado global con Pinia (getters, setters, actions)
├── composables/      # Lógica reutilizable (wrappers opcionales)
├── views/            # Páginas principales de la app
├── components/       # Componentes reutilizables
└── main.js           # Punto de entrada
```

---

## 🔄 Flujo de Datos

```
View/Component → Composable → Store (actions) → Service → API → Backend
                    ↓              ↓               ↓
                 Sintaxis      Estado Global   Solo HTTP
```

---

## 📋 Responsabilidades por Capa

### 1️⃣ **Services** (`src/services/`)
**Responsabilidad:** Solo peticiones HTTP, sin lógica de negocio

```javascript
// authService.js
export const authService = {
  async login(email, password) {
    return await backendApi.auth.login(email, password)
  },
  
  async getCurrentUser() {
    return await backendApi.auth.me()
  }
}
```

**✅ Hace:**
- Llamadas HTTP
- Recibir/enviar parámetros
- Retornar respuestas crudas

**❌ NO hace:**
- Manejo de estado
- Validaciones de negocio
- Transformaciones complejas

---

### 2️⃣ **Stores** (`src/stores/`)
**Responsabilidad:** Estado global + lógica de negocio

```javascript
// authStore.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const response = await authService.login(email, password)
        this.user = response.data
        this.isAuthenticated = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

**✅ Hace:**
- Gestionar estado (state)
- Computar valores derivados (getters)
- Lógica de negocio (actions)
- Llamar a services
- Manejo de errores
- Loading states

**❌ NO hace:**
- Peticiones HTTP directas (usa services)

---

### 3️⃣ **Composables** (`src/composables/`) - OPCIONAL
**Responsabilidad:** Wrapper para sintaxis limpia

```javascript
// useAuth.js
export function useAuth() {
  const authStore = useAuthStore()
  const { currentUser, isAdmin } = storeToRefs(authStore)
  
  return {
    currentUser,
    isAdmin,
    login: authStore.login,
    logout: authStore.logout,
  }
}
```

**✅ Hace:**
- Simplificar acceso al store
- Sintaxis consistente
- Extraer reactividad con storeToRefs

**❌ NO hace:**
- Lógica de negocio (eso va en el store)

---

### 4️⃣ **Views** (`src/views/`)
**Responsabilidad:** Páginas principales

```vue
<!-- DashboardView.vue -->
<template>
  <div>
    <h1>Dashboard</h1>
    <AdminPanel v-if="isAdmin" />
    <UserPanel v-else />
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
const { isAdmin } = useAuth()
</script>
```

**✅ Hace:**
- Layout de página
- Orquestar componentes
- Routing

**❌ NO hace:**
- Lógica compleja (usa composables/stores)

---

### 5️⃣ **Components** (`src/components/`)
**Responsabilidad:** Componentes reutilizables

```vue
<!-- Login.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" />
    <input v-model="password" type="password" />
    <button>Login</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()
const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  await login(email.value, password.value)
  emit('login-success')
}

const emit = defineEmits(['login-success'])
</script>
```

**✅ Hace:**
- UI reutilizable
- Props y emits
- Validaciones de formulario

---

## 📖 Ejemplo Completo: Login

### 1. **Service** - Solo HTTP
```javascript
// services/authService.js
export const authService = {
  async login(email, password) {
    return await backendApi.auth.login(email, password)
  }
}
```

### 2. **Store** - Estado + Lógica
```javascript
// stores/authStore.js
actions: {
  async login(email, password) {
    this.loading = true
    const response = await authService.login(email, password)
    this.user = response.data
    this.isAuthenticated = true
    this.loading = false
  }
}
```

### 3. **Composable** - Sintaxis limpia
```javascript
// composables/useAuth.js
export function useAuth() {
  const authStore = useAuthStore()
  return {
    login: authStore.login
  }
}
```

### 4. **Component** - UI
```vue
<!-- components/Login.vue -->
<script setup>
const { login } = useAuth()
await login(email, password)
</script>
```

---

## 🎯 Reglas de Oro

1. **Services** = Solo peticiones HTTP
2. **Stores** = Estado + lógica de negocio
3. **Composables** = Sintaxis limpia (opcional)
4. **Views** = Páginas (orquestación)
5. **Components** = UI reutilizable

**Nunca:** Mezclar responsabilidades entre capas
**Siempre:** Flujo unidireccional de datos
