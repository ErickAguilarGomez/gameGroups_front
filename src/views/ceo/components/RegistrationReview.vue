<template>
  <div class="registration-review">
    <div class="header">
      <h2>Revisión de Solicitudes de Registro</h2>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-number">{{ stats.pending }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat-card approved">
          <span class="stat-number">{{ stats.approved }}</span>
          <span class="stat-label">Aprobados</span>
        </div>
        <div class="stat-card rejected">
          <span class="stat-number">{{ stats.rejected }}</span>
          <span class="stat-label">Rechazados</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando solicitudes...</div>

    <div v-else-if="pendingUsers.length === 0" class="empty-state">
      <p>✅ No hay solicitudes de registro pendientes</p>
    </div>

    <div v-else class="users-grid">
      <div v-for="user in pendingUsers" :key="user.id" class="user-card">
        <div class="user-info">
          <div class="user-photo">
            <img 
              v-if="user.photo_url" 
              :src="user.photo_url" 
              :alt="user.name"
              @click="openPhotoModal(user.photo_url)"
            />
            <div v-else class="no-photo">Sin foto</div>
          </div>
          
          <div class="user-details">
            <h3>{{ user.name }}</h3>
            <p class="email">{{ user.email }}</p>
            <p class="birthdate">
              <strong>Fecha de nacimiento:</strong> 
              {{ formatDate(user.birthdate) }}
            </p>
            <p class="registered">
              <strong>Registrado:</strong> 
              {{ formatDate(user.created_at) }}
            </p>
          </div>
        </div>

        <div class="actions">
          <!-- Rechazar usuario completo -->
          <button 
            class="btn btn-reject-user" 
            @click="openRejectModal(user)"
          >
            ❌ Rechazar Registro
          </button>

          <!-- Aprobar sin foto -->
          <button 
            v-if="!user.photo_url"
            class="btn btn-approve" 
            @click="openApproveModal(user, 'approve')"
          >
            ✅ Aprobar Usuario
          </button>

          <!-- Aprobar con decisión de foto -->
          <div v-else class="photo-decision">
            <button 
              class="btn btn-approve-both" 
              @click="openApproveModal(user, 'approve')"
            >
              ✅✅ Aprobar Todo
            </button>
            <button 
              class="btn btn-approve-reject-photo" 
              @click="openApproveModal(user, 'reject')"
            >
              ✅❌ Aprobar / Rechazar Foto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para aprobar con opción de grupo -->
    <div v-if="showApproveModal" class="modal-overlay" @click="closeApproveModal">
      <div class="modal-content" @click.stop>
        <h3>Aprobar Usuario</h3>
        <p>Usuario: <strong>{{ selectedUser?.name }}</strong></p>
        
        <div class="form-group">
          <label>Asignar a un grupo (opcional)</label>
          <select v-model="selectedGroupId">
            <option :value="null">Sin grupo</option>
            <option v-for="group in groupsList" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeApproveModal">Cancelar</button>
          <button class="btn btn-confirm-approve" @click="confirmApprove">Aprobar</button>
        </div>
      </div>
    </div>

    <!-- Modal para rechazar -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3>Rechazar Solicitud de Registro</h3>
        <p>Usuario: <strong>{{ selectedUser?.name }}</strong></p>
        
        <textarea 
          v-model="rejectReason" 
          placeholder="Razón del rechazo (opcional)"
          rows="4"
        ></textarea>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeRejectModal">Cancelar</button>
          <button class="btn btn-confirm-reject" @click="confirmReject">Confirmar Rechazo</button>
        </div>
      </div>
    </div>

    <!-- Modal para ver foto grande -->
    <div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
      <div class="modal-photo" @click.stop>
        <button class="close-btn" @click="closePhotoModal">✕</button>
        <img :src="selectedPhotoUrl" alt="Foto ampliada" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { registrations, groups } from '@/api/backendApi'

interface User {
  id: number
  name: string
  email: string
  birthdate: string
  photo_url: string | null
  created_at: string
}

interface Group {
  id: number
  name: string
}

const pendingUsers = ref<User[]>([])
const stats = ref({ pending: 0, approved: 0, rejected: 0 })
const loading = ref(false)
const showRejectModal = ref(false)
const showApproveModal = ref(false)
const showPhotoModal = ref(false)
const groupsList = ref<Group[]>([])
const selectedGroupId = ref<number | null>(null)
const approvePhotoDecision = ref<'approve' | 'reject'>('approve')
const selectedUser = ref<User | null>(null)
const selectedPhotoUrl = ref<string>('')
const rejectReason = ref('')

onMounted(() => {
  loadPendingUsers()
  loadStats()
  loadGroups()
})

async function loadGroups() {
  try {
    const response = await groups.all()
    groupsList.value = response.data
  } catch (error) {
    console.error('Error al cargar grupos:', error)
  }
}

async function loadPendingUsers() {
  loading.value = true
  try {
    const response = await registrations.pending()
    pendingUsers.value = response.data
  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response = await registrations.stats()
    stats.value = response.data
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

function openApproveModal(user: User, photoDecision: 'approve' | 'reject') {
  selectedUser.value = user
  approvePhotoDecision.value = photoDecision
  selectedGroupId.value = null
  showApproveModal.value = true
}

function closeApproveModal() {
  showApproveModal.value = false
  selectedUser.value = null
  selectedGroupId.value = null
}

async function confirmApprove() {
  if (!selectedUser.value) return

  try {
    await registrations.approve(
      selectedUser.value.id, 
      approvePhotoDecision.value,
      selectedGroupId.value || undefined
    )
    
    const message = approvePhotoDecision.value === 'approve' 
      ? '✅ Usuario y foto aprobados' 
      : '✅ Usuario aprobado (foto rechazada, deberá subir otra)'
    
    alert(message)
    closeApproveModal()
    loadPendingUsers()
    loadStats()
  } catch (error) {
    console.error('Error al aprobar:', error)
    alert('Error al aprobar el usuario')
  }
}

function openRejectModal(user: User) {
  selectedUser.value = user
  rejectReason.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  selectedUser.value = null
  rejectReason.value = ''
}

async function confirmReject() {
  if (!selectedUser.value) return

  try {
    await registrations.reject(selectedUser.value.id, rejectReason.value)
    alert('❌ Solicitud rechazada')
    closeRejectModal()
    loadPendingUsers()
    loadStats()
  } catch (error) {
    console.error('Error al rechazar:', error)
    alert('Error al rechazar la solicitud')
  }
}

function openPhotoModal(photoUrl: string) {
  selectedPhotoUrl.value = photoUrl
  showPhotoModal.value = true
}

function closePhotoModal() {
  showPhotoModal.value = false
  selectedPhotoUrl.value = ''
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.registration-review {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  min-width: 150px;
  text-align: center;
  border: 2px solid #dee2e6;
}

.stat-card.approved {
  background: #d4edda;
  border-color: #28a745;
}

.stat-card.rejected {
  background: #f8d7da;
  border-color: #dc3545;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.user-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.user-photo {
  flex-shrink: 0;
}

.user-photo img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-photo img:hover {
  transform: scale(1.05);
}

.no-photo {
  width: 100px;
  height: 100px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.user-details h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.user-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.email {
  color: #4CAF50 !important;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-decision {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-reject-user {
  background: #dc3545;
  color: white;
}

.btn-approve {
  background: #28a745;
  color: white;
}

.btn-approve-both {
  background: #28a745;
  color: white;
  flex: 1;
}

.btn-approve-reject-photo {
  background: #ffc107;
  color: #333;
  flex: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-content textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  margin: 15px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-confirm-reject {
  background: #dc3545;
  color: white;
}

.modal-photo {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-photo img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
}
</style>
