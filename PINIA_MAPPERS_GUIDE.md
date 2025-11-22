# 🗺️ Guía de Mappers en Pinia (equivalente a Vuex)

## 📋 Comparación Vuex vs Pinia

### VUEX (Vue 2)
```javascript
import { mapGetters, mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAdmin']),
    ...mapState('auth', ['loading'])
  },
  methods: {
    ...mapActions('auth', ['login', 'logout'])
  }
}
```

### PINIA (Options API)
```javascript
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export default {
  computed: {
    // state + getters juntos
    ...mapState(useAuthStore, ['currentUser', 'isAdmin', 'loading'])
  },
  methods: {
    ...mapActions(useAuthStore, ['login', 'logout'])
  }
}
```

---

## 🎯 3 Formas de Usar Stores en Pinia

### 1️⃣ Options API con Mappers (como Vuex)

```vue
<template>
  <div>
    <p>{{ currentUser?.name }}</p>
    <p>Es Admin: {{ isAdmin }}</p>
    <button @click="logout">Salir</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export default {
  computed: {
    ...mapState(useAuthStore, [
      'currentUser',  // getter
      'isAdmin',      // getter
      'userEmail',    // getter
      'loading'       // state
    ])
  },
  
  methods: {
    ...mapActions(useAuthStore, [
      'login',
      'logout',
      'fetchUser'
    ])
  }
}
</script>
```

**✅ Ventajas:**
- Familiar si vienes de Vuex
- No necesitas imports en template

**❌ Desventajas:**
- Más verboso
- Options API (menos moderno que Composition API)

---

### 2️⃣ Composition API con storeToRefs

```vue
<template>
  <div>
    <p>{{ currentUser?.name }}</p>
    <p>Es Admin: {{ isAdmin }}</p>
    <button @click="handleLogout">Salir</button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// GETTERS + STATE (con reactividad)
const { currentUser, isAdmin, userEmail, loading } = storeToRefs(authStore)

// ACTIONS (sin storeToRefs)
const { login, logout, fetchUser } = authStore

const handleLogout = async () => {
  await logout()
}
</script>
```

**✅ Ventajas:**
- Composition API moderno
- TypeScript friendly
- Más flexible

**❌ Desventajas:**
- Necesitas recordar usar `storeToRefs` para state/getters

---

### 3️⃣ Composable Personalizado (TU PROYECTO) ⭐

```vue
<template>
  <div>
    <p>{{ currentUser?.name }}</p>
    <p>Es Admin: {{ isAdmin }}</p>
    <button @click="logout">Salir</button>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

// Una sola línea, todo listo ✨
const { currentUser, isAdmin, userEmail, login, logout } = useAuth()
</script>
```

**✅ Ventajas:**
- ✨ **MÁS LIMPIO**
- ✨ Una sola línea
- ✨ `storeToRefs` ya aplicado internamente
- ✨ Sintaxis consistente en toda la app
- ✨ TypeScript out of the box

**Esta es la que estás usando** ← **RECOMENDADO** 🎯

---

## 🌍 Uso Global (sin imports en cada componente)

### Opción A: Plugin Global

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Disponible globalmente
app.config.globalProperties.$auth = useAuthStore

// En Options API:
this.$auth.currentUser
this.$auth.login(email, password)
```

**❌ No recomendado:** Contamina scope global, dificulta testing

---

### Opción B: Provide/Inject

```javascript
// App.vue
import { provide } from 'vue'
import { useAuthStore } from '@/stores/authStore'

provide('authStore', useAuthStore())

// En componente hijo:
import { inject } from 'vue'
const authStore = inject('authStore')
```

**❌ No recomendado:** Más complejo sin beneficios claros

---

### Opción C: Composable (RECOMENDADO) ✅

```javascript
// useAuth.js ya creado
import { useAuth } from '@/composables/useAuth'
const { currentUser, login } = useAuth()
```

**✅ MEJOR OPCIÓN:**
- No contamina scope global
- Fácil de testear
- TypeScript friendly
- Import explícito (mejor para tree-shaking)

---

## 📖 Tabla de Equivalencias

| Vuex | Pinia Options | Pinia Composition | Tu Proyecto (useAuth) |
|------|---------------|-------------------|----------------------|
| `...mapGetters('auth', ['currentUser'])` | `...mapState(useAuthStore, ['currentUser'])` | `const { currentUser } = storeToRefs(authStore)` | `const { currentUser } = useAuth()` |
| `...mapActions('auth', ['login'])` | `...mapActions(useAuthStore, ['login'])` | `const { login } = authStore` | `const { login } = useAuth()` |
| `this.$store.getters['auth/currentUser']` | `this.currentUser` (con mapper) | `currentUser.value` | `currentUser.value` |
| `this.$store.dispatch('auth/login', data)` | `this.login(data)` | `login(data)` | `login(data)` |

---

## 🎯 RESUMEN: ¿Cuál usar?

```javascript
// ❌ NO RECOMENDADO (verboso)
import { mapState, mapActions } from 'pinia'
...mapState(useAuthStore, ['currentUser'])
...mapActions(useAuthStore, ['login'])

// ⚠️ FUNCIONA (manual)
import { storeToRefs } from 'pinia'
const { currentUser } = storeToRefs(useAuthStore())

// ✅ RECOMENDADO (tu proyecto)
import { useAuth } from '@/composables/useAuth'
const { currentUser, login } = useAuth()
```

**Tu proyecto YA usa la mejor opción** 🎉
