# Frontend API - Guía de Uso

Este proyecto usa **Axios** para todas las peticiones al backend. Todas las llamadas están centralizadas en `src/api/backendApi.js`.

## 📦 Instalación

```bash
npm install axios
```

## 🔧 Configuración

El archivo `src/api/backendApi.js` contiene:
- ✅ Configuración base de Axios (baseURL, credentials)
- ✅ Interceptor automático para `X-XSRF-TOKEN`
- ✅ Manejo de errores global (401, 419)
- ✅ Módulos organizados por funcionalidad

## 📚 Uso Básico

### Importar API

```javascript
import { auth, users, tokens, publicApi } from '@/api/backendApi'
// O importar todo:
import backendApi from '@/api/backendApi'
```

---

## 🔐 Autenticación

### Login
```javascript
import { auth } from '@/api/backendApi'

async function login() {
  try {
    // 1. Obtener CSRF cookie (obligatorio antes del login)
    await auth.csrf()

    // 2. Login
    const response = await auth.login('admin@example.com', 'secret123')
    const user = response.data
    
    console.log('Usuario:', user)
  } catch (error) {
    console.error('Error:', error.response?.data?.message)
  }
}
```

### Logout
```javascript
async function logout() {
  try {
    await auth.logout()
    console.log('Sesión cerrada')
  } catch (error) {
    console.error('Error al cerrar sesión')
  }
}
```

### Obtener usuario actual
```javascript
async function getCurrentUser() {
  try {
    const response = await auth.me()
    const user = response.data
    console.log('Usuario actual:', user)
  } catch (error) {
    console.log('No hay sesión activa')
  }
}
```

### Generar token Bearer (para APIs externas)
```javascript
async function createApiToken() {
  const response = await auth.createToken(
    'admin@example.com',
    'secret123',
    'mi-app-movil'
  )
  
  const { token, user } = response.data
  console.log('Token generado:', token)
}
```

---

## 👥 Usuarios

### Listar todos los usuarios (admin)
```javascript
import { users } from '@/api/backendApi'

async function getAllUsers() {
  try {
    const response = await users.list()
    const usersList = response.data
    
    console.log('Usuarios:', usersList)
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('No tienes permisos (solo admin)')
    }
  }
}
```

### Usuarios conectados
```javascript
async function getConnectedUsers() {
  try {
    // Últimos 5 minutos (por defecto)
    const response = await users.connected()
    const connectedList = response.data
    
    console.log('Usuarios conectados:', connectedList)
    
    // O especificar minutos:
    const response2 = await users.connected(10) // últimos 10 min
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Obtener un usuario por ID
```javascript
async function getUserById(id) {
  try {
    const response = await users.get(id)
    const user = response.data
    
    console.log('Usuario:', user)
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('No tienes permiso para ver este usuario')
    }
  }
}
```

### Actualizar usuario
```javascript
async function updateUser(id, data) {
  try {
    const response = await users.update(id, {
      name: 'Nuevo Nombre',
      email: 'nuevo@email.com',
      password: 'nueva_password', // opcional
      role: 'admin', // solo admin puede cambiar esto
    })
    
    const updatedUser = response.data
    console.log('Usuario actualizado:', updatedUser)
  } catch (error) {
    console.error('Error:', error.response?.data)
  }
}
```

### Eliminar usuario (soft delete)
```javascript
async function deleteUser(id) {
  try {
    await users.delete(id)
    console.log('Usuario eliminado')
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Solo admin puede eliminar usuarios')
    }
  }
}
```

---

## 🔑 Tokens (gestión)

### Listar tokens del usuario
```javascript
import { tokens } from '@/api/backendApi'

async function listMyTokens() {
  const response = await tokens.list()
  const myTokens = response.data
  
  console.log('Mis tokens:', myTokens)
}
```

### Revocar token actual
```javascript
async function revokeCurrentToken() {
  await tokens.revoke()
  console.log('Token revocado')
}
```

### Revocar todos los tokens
```javascript
async function revokeAllTokens() {
  await tokens.revokeAll()
  console.log('Todos los tokens revocados')
}
```

---

## 🌍 API Pública

### Status del servidor
```javascript
import { publicApi } from '@/api/backendApi'

async function checkStatus() {
  const response = await publicApi.status()
  const status = response.data
  
  console.log('Status:', status) // { status: 'ok', timestamp: '...' }
}
```

---

## 🎯 Ejemplo Completo en un Componente

```vue
<template>
  <div>
    <h2>Lista de Usuarios</h2>
    <button @click="loadUsers">Cargar Usuarios</button>
    
    <ul>
      <li v-for="user in usersList" :key="user.id">
        {{ user.name }} - {{ user.email }}
        <button @click="editUser(user.id)">Editar</button>
        <button @click="deleteUser(user.id)">Eliminar</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { users } from '@/api/backendApi'

const usersList = ref([])

async function loadUsers() {
  try {
    const response = await users.list()
    usersList.value = response.data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  }
}

async function editUser(id) {
  try {
    await users.update(id, { name: 'Nombre Editado' })
    loadUsers() // Recargar lista
  } catch (error) {
    alert('Error al editar usuario')
  }
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar usuario?')) return
  
  try {
    await users.delete(id)
    loadUsers() // Recargar lista
  } catch (error) {
    alert('Error al eliminar usuario')
  }
}
</script>
```

---

## 🛠️ Peticiones Personalizadas

Si necesitas hacer una petición que no está en los módulos:

```javascript
import backendApi from '@/api/backendApi'

// GET
const response = await backendApi.get('/api/custom-endpoint', {
  params: { filter: 'value' }
})

// POST
const response = await backendApi.post('/api/custom-endpoint', {
  data: 'value'
})

// PUT
const response = await backendApi.put('/api/custom-endpoint/123', {
  name: 'updated'
})

// DELETE
const response = await backendApi.delete('/api/custom-endpoint/123')
```

---

## ✨ Ventajas de esta Arquitectura

1. **Código centralizado** → Todos los endpoints en un solo lugar
2. **Auto-manejo de CSRF** → No necesitas preocuparte por el token XSRF
3. **Cookies automáticas** → `withCredentials: true` en todas las peticiones
4. **Type-safe** → Fácil de extender con TypeScript
5. **Manejo de errores** → Interceptores globales para 401, 419
6. **Modular** → Fácil agregar nuevos módulos (ej: `posts`, `comments`)

---

## 🚀 Agregar Nuevos Endpoints

### 1. Editar `src/api/backendApi.js`:

```javascript
export const posts = {
  list: () => backendApi.get('/api/posts'),
  create: (data) => backendApi.post('/api/posts', data),
  get: (id) => backendApi.get(`/api/posts/${id}`),
  update: (id, data) => backendApi.put(`/api/posts/${id}`, data),
  delete: (id) => backendApi.delete(`/api/posts/${id}`),
}
```

### 2. Usar en componentes:

```javascript
import { posts } from '@/api/backendApi'

const response = await posts.list()
```

---

## 📝 Notas

- Todas las peticiones usan **cookies** automáticamente
- El **token XSRF** se añade automáticamente en cada petición
- Si recibes **401**, significa que no hay sesión activa
- Si recibes **419**, el token CSRF expiró (recarga la página)
- Si recibes **403**, no tienes permisos para esa acción
