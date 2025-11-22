<template>
  <div class="user-groups-gamer">
    <!-- Header con perfil -->
    <div class="header-container">
      <div class="header-content">
        <h1 class="page-title">
          <IconUsersGroup :size="32" />
          Grupos
        </h1>
        <p class="page-subtitle">Vista de todos los grupos disponibles</p>
      </div>
      <!-- Profile Button -->
      <div class="profile-section">
        <div class="profile-avatar" @click="showProfileModal = true">
          <img 
            v-if="currentUser?.photo_url && currentUser?.photo_status ==='approved'" 
            :src="currentUser.photo_url" 
            :alt="currentUser.name"
          />
          <div v-else class="avatar-placeholder">
            <IconUser :size="32" />
          </div>
          <button class="edit-profile-btn">
            <IconEdit :size="16" />
          </button>
        </div>
        <div v-if="currentUser" class="profile-info">
          <p class="profile-name">{{ currentUser.name }}</p>
          <p class="profile-email">{{ currentUser.email }}</p>
        </div>
      </div>
    </div>

    <!-- Groups Grid -->
    <div class="groups-grid">
      <!-- Usuarios sin grupo -->
      <div class="group-card-gamer no-group-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <IconUserOff :size="24" />
            <h3>Sin Grupo</h3>
          </div>
          <BBadge variant="warning" class="user-count-badge">
            {{ usersWithoutGroup.length }}
          </BBadge>
        </div>
        
        <div class="users-grid">
          <div 
            v-for="user in usersWithoutGroup" 
            :key="user.id" 
            class="user-card-mini"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img 
                v-if="user.photo_url && user.photo_status === 'approved'" 
                :src="user.photo_url" 
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
          </div>
          <div v-if="usersWithoutGroup.length === 0" class="empty-state">
            <IconMoodEmpty :size="48" />
            <p>Todos asignados</p>
          </div>
        </div>
      </div>

      <!-- Mi Grupo -->
      <div v-if="myGroup" class="group-card-gamer my-group-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <div class="group-avatar">
              <img 
                v-if="myGroup.group_img_url" 
                :src="myGroup.group_img_url" 
                :alt="myGroup.name"
              />
              <IconFolder v-else :size="24" />
            </div>
            <h3>{{ myGroup.name }}</h3>
          </div>
          <BBadge variant="success" class="my-group-badge">
            Mi Grupo
          </BBadge>
        </div>
        
        <div class="users-grid">
          <div 
            v-for="user in myGroup.users" 
            :key="user.id" 
            class="user-card-mini"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img 
                v-if="user.photo_url && user.photo_status === 'approved'" 
                :src="user.photo_url" 
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
          </div>
        </div>
      </div>

      <!-- Otros Grupos -->
      <div 
        v-for="group in otherGroups" 
        :key="group.id" 
        class="group-card-gamer"
      >
        <div class="card-header-gamer">
          <div class="header-content">
            <div class="group-avatar">
              <img 
                v-if="group.group_img_url" 
                :src="group.group_img_url" 
                :alt="group.name"
              />
              <IconFolder v-else :size="24" />
            </div>
            <h3>{{ group.name }}</h3>
          </div>
          <BBadge variant="info" class="user-count-badge">
            {{ group.users?.length || 0 }}
          </BBadge>
        </div>
        
        <div class="users-grid">
          <div 
            v-for="user in group.users" 
            :key="user.id" 
            class="user-card-mini"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img 
                v-if="user.photo_url && user.photo_status === 'approved'" 
                :src="user.photo_url" 
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
          </div>
          <div v-if="!group.users || group.users.length === 0" class="empty-state">
            <IconMoodEmpty :size="48" />
            <p>Sin miembros</p>
          </div>
        </div>
      </div>

      <!-- Usuarios Baneados -->
      <div class="group-card-gamer banned-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <IconBan :size="24" />
            <h3>Baneados</h3>
          </div>
          <BBadge variant="danger" class="user-count-badge">
            {{ bannedUsers.length }}
          </BBadge>
        </div>
        
        <div class="users-grid">
          <div 
            v-for="user in bannedUsers" 
            :key="user.id" 
            class="user-card-mini banned-user"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img 
                v-if="user.photo_url && user.photo_status === 'approved'" 
                :src="user.photo_url" 
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
          </div>
          <div v-if="bannedUsers.length === 0" class="empty-state">
            <IconMoodEmpty :size="48" />
            <p>No hay usuarios baneados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <UserDetailModal
      v-model="showUserDetail"
      :user="selectedUser as any"
    />

    <!-- Profile Edit Modal -->
    <ProfileEditModal
      v-model="showProfileModal"
      :user="currentUser"
      @updated="handleProfileUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { BBadge } from 'bootstrap-vue-next'
import { groups } from '@/api/backendApi'
import { useAuthStore } from '@/stores/authStore'
import UserDetailModal from '@/views/ceo/components/groups/UserDetailModal.vue'
import ProfileEditModal from '../components/ProfileEditModal.vue'
import {
  IconUsersGroup,
  IconUser,
  IconFolder,
  IconMoodEmpty,
  IconEdit,
  IconUserOff,
  IconBan
} from '@tabler/icons-vue'

interface Group {
  id: number
  name: string
  group_img_url: string | null
  users?: User[]
}

interface User {
  id: number
  name: string
  email: string
  photo_url?: string | null
  photo_status?: string
  nickname?: string | null
  birthdate?: string | null
  group_id?: number | null
  account_status?: string
  created_at?: string
  banned_at?: string | null
  ban_reason?: string | null
}

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user as any)

const groupsList = ref<Group[]>([])
const usersWithoutGroup = ref<User[]>([])
const bannedUsers = ref<User[]>([])
const showUserDetail = ref(false)
const selectedUser = ref<User | null>(null)
const showProfileModal = ref(false)

const myGroup = computed(() => {
  if (!currentUser.value?.group_id) return null
  return groupsList.value.find(g => g.id === currentUser.value?.group_id)
})

const otherGroups = computed(() => {
  if (!currentUser.value?.group_id) return groupsList.value
  return groupsList.value.filter(g => g.id !== currentUser.value?.group_id)
})

onMounted(() => {
  loadGroups()
  loadUsersWithoutGroup()
  loadBannedUsers()
})

async function loadGroups() {
  try {
    const response = await groups.all()
    // La respuesta es directamente un array de grupos con usuarios
    groupsList.value = response.data
    console.log('📦 Grupos cargados:', groupsList.value)
  } catch (error) {
    console.error('Error al cargar grupos:', error)
  }
}

async function loadUsersWithoutGroup() {
  try {
    const response = await groups.usersWithoutGroup()
    usersWithoutGroup.value = response.data
  } catch (error) {
    console.error('Error al cargar usuarios sin grupo:', error)
    usersWithoutGroup.value = []
  }
}

async function loadBannedUsers() {
  try {
    const response = await groups.bannedUsers()
    bannedUsers.value = response.data || []
  } catch (error) {
    console.error('Error al cargar usuarios baneados:', error)
    bannedUsers.value = []
  }
}

function openUserDetail(user: User) {
  selectedUser.value = user
  showUserDetail.value = true
}

function handleProfileUpdated() {
  authStore.fetchUser()
}
</script>

<style scoped>
.user-groups-gamer {
  padding: 2rem;
  background: #0f0f23;
  min-height: 100vh;
}

/* Header */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #a1a1aa;
  font-size: 0.9375rem;
  margin: 0;
}

/* Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  transition: all 0.3s;
}

.profile-section:hover {
  border-color: #00d9ff;
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.2);
}

.profile-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #00d9ff;
  box-shadow: 0 0 16px rgba(0, 217, 255, 0.4);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.edit-profile-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00d9ff;
  border: 2px solid #1a1a2e;
  color: #0f0f23;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-profile-btn:hover {
  background: #7c3aed;
  transform: scale(1.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0;
}

.profile-email {
  font-size: 0.8125rem;
  color: #a1a1aa;
  margin: 0;
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.group-card-gamer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.group-card-gamer:hover {
  transform: translateY(-4px);
  border-color: #00d9ff;
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.2);
}

.my-group-card {
  border-color: rgba(34, 197, 94, 0.3);
}

.my-group-card:hover {
  border-color: #22c55e;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
}

.no-group-card {
  border-color: rgba(251, 191, 36, 0.3);
}

.no-group-card:hover {
  border-color: #fbbf24;
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.2);
}

.banned-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.banned-card:hover {
  border-color: #ef4444;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
}

/* Card Header */
.card-header-gamer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e4e4e7;
}

.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
}

.group-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-count-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.my-group-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: #22c55e !important;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  flex: 1;
}

.user-card-mini {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.user-card-mini:hover {
  background: rgba(0, 217, 255, 0.1);
  border-color: #00d9ff;
  transform: translateY(-2px);
}

.user-avatar-mini {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 217, 255, 0.3);
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-mini {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.user-name-mini {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e4e4e7;
  text-align: center;
  word-break: break-word;
}

.user-card-mini.banned-user {
  opacity: 0.7;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.user-card-mini.banned-user:hover {
  opacity: 1;
  border-color: #ef4444;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #52525b;
  gap: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
