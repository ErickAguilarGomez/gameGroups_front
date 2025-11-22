# 🗺️ Estructura de Rutas por Roles

## 📂 Estructura del Proyecto

```
src/
├── router/
│   └── index.ts              # Router principal con guards
├── views/
│   ├── LoginView.vue         # Vista de login
│   ├── NotFound.vue          # 404
│   ├── ceo/                  # Módulo CEO (Admin)
│   │   ├── CeoDashboard.vue  # Layout con sidebar
│   │   ├── components/       # Componentes específicos de CEO
│   │   │   ├── Dashboard.vue
│   │   │   ├── Users.vue
│   │   │   ├── Analytics.vue
│   │   │   └── Settings.vue
│   │   ├── data/             # Datos/tipos específicos
│   │   ├── routes/           # Rutas del módulo CEO
│   │   │   └── index.ts
│   │   ├── services/         # Servicios específicos de CEO
│   │   └── store/            # Stores específicos de CEO
│   └── user/                 # Módulo Usuario
│       ├── UserDashboard.vue # Layout con sidebar
│       ├── components/       # Componentes específicos de User
│       │   ├── Dashboard.vue
│       │   ├── Profile.vue
│       │   ├── Tasks.vue
│       │   └── Settings.vue
│       ├── data/
│       ├── routes/
│       │   └── index.ts
│       ├── services/
│       └── store/
```

---

## 🔐 Rutas y Permisos

### Públicas (sin autenticación)
- `/` → Redirige a `/login`
- `/login` → Vista de login

### CEO/Admin (requiere `role: 'admin'`)
- `/ceo` → Dashboard CEO
- `/ceo/users` → Gestión de usuarios
- `/ceo/analytics` → Analytics del sistema
- `/ceo/settings` → Configuración global

### Usuario (requiere `role: 'user'`)
- `/user` → Dashboard Usuario
- `/user/profile` → Mi perfil
- `/user/tasks` → Mis tareas
- `/user/settings` → Mi configuración

---

## 🛡️ Protección de Rutas (Guards)

El router tiene un **guard global** en `src/router/index.ts`:

```typescript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 1. Verificar autenticación
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      await authStore.fetchUser()
      if (!authStore.isAuthenticated) {
        return next({ name: 'Login' })
      }
    }
  }
  
  // 2. Verificar rol de admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'UserDashboard' })
  }
  
  // 3. Verificar rol de user
  if (to.meta.requiresUser && authStore.isAdmin) {
    return next({ name: 'CeoDashboard' })
  }
  
  next()
})
```

---

## 🎯 Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. `LoginView.vue` llama a `useAuth().login()`
3. Si login exitoso, redirige según rol:
   - Admin → `/ceo`
   - User → `/user`
4. Guard verifica sesión en cada navegación

---

## 📝 Cómo Agregar Nuevas Rutas

### Para CEO:

```typescript
// src/views/ceo/routes/index.ts
{
  path: 'nueva-seccion',
  name: 'CeoNuevaSeccion',
  component: () => import('@/views/ceo/components/NuevaSeccion.vue'),
  meta: { title: 'Nueva Sección' }
}
```

### Para User:

```typescript
// src/views/user/routes/index.ts
{
  path: 'nueva-seccion',
  name: 'UserNuevaSeccion',
  component: () => import('@/views/user/components/NuevaSeccion.vue'),
  meta: { title: 'Nueva Sección' }
}
```

---

## 🚀 Comandos

```bash
# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Verificar tipos TypeScript
npm run type-check
```

---

## 💡 Ventajas de esta Estructura

✅ **Modular**: Cada rol tiene su carpeta independiente  
✅ **Escalable**: Fácil agregar más roles o secciones  
✅ **Organizado**: components/services/stores por módulo  
✅ **Seguro**: Guards protegen rutas por rol  
✅ **Mantenible**: Cambios en un módulo no afectan otros  

---

## 🔄 Navegación entre Módulos

```vue
<!-- En cualquier componente -->
<template>
  <router-link :to="{ name: 'CeoDashboard' }">Dashboard CEO</router-link>
  <router-link :to="{ name: 'UserProfile' }">Mi Perfil</router-link>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Navegación programática
router.push({ name: 'CeoUsers' })
router.push('/user/tasks')
</script>
```
