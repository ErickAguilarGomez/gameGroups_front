<template>
  <div class="photo-review">
    <div class="header">
      <h1>Revisión de Fotos de Perfil</h1>
      <button @click="refresh" :disabled="loading" class="btn-refresh">
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats" v-if="stats">
      <div class="stat-card">
        <h3>Pendientes</h3>
        <p class="stat-value pending">{{ stats.pending }}</p>
      </div>
      <div class="stat-card">
        <h3>Aprobadas</h3>
        <p class="stat-value approved">{{ stats.approved }}</p>
      </div>
      <div class="stat-card">
        <h3>Rechazadas</h3>
        <p class="stat-value rejected">{{ stats.rejected }}</p>
      </div>
      <div class="stat-card">
        <h3>Sin Foto</h3>
        <p class="stat-value">{{ stats.no_photo }}</p>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="error = null" class="btn-close">✕</button>
    </div>

    <!-- Loading -->
    <div v-if="loading && pendingPhotos.length === 0" class="loading">
      Cargando fotos pendientes...
    </div>

    <!-- Empty state -->
    <div v-else-if="pendingPhotos.length === 0" class="empty">
      <div class="empty-icon">✓</div>
      <h3>No hay fotos pendientes</h3>
      <p>Todas las fotos han sido revisadas</p>
    </div>

    <!-- Photos grid -->
    <div v-else class="photos-grid">
      <div 
        v-for="user in pendingPhotos" 
        :key="user.id" 
        class="photo-card"
      >
        <div class="photo-container">
          <img :src="user.photo_url" :alt="user.name" />
        </div>
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p class="email">{{ user.email }}</p>
          <p class="date">Subida: {{ formatDate(user.created_at) }}</p>
        </div>
        <div class="actions">
          <button 
            @click="handleApprove(user)" 
            class="btn-approve"
            :disabled="processing === user.id"
          >
            ✓ Aprobar
          </button>
          <button 
            @click="handleReject(user)" 
            class="btn-reject"
            :disabled="processing === user.id"
          >
            ✕ Rechazar
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3>Rechazar Foto</h3>
        <p>Usuario: <strong>{{ selectedUser?.name }}</strong></p>
        <div class="form-group">
          <label>Razón del rechazo (opcional)</label>
          <textarea 
            v-model="rejectReason" 
            placeholder="Explica por qué se rechaza la foto..."
            rows="4"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeRejectModal" class="btn-cancel">
            Cancelar
          </button>
          <button @click="confirmReject" class="btn-confirm-reject">
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ceoServices } from '../services'

interface User {
  id: number
  name: string
  email: string
  photo_url: string
  photo_status: string
  created_at: string
}

interface Stats {
  pending: number
  approved: number
  rejected: number
  no_photo: number
}

const pendingPhotos = ref<User[]>([])
const stats = ref<Stats | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const processing = ref<number | null>(null)
const showRejectModal = ref(false)
const selectedUser = ref<User | null>(null)
const rejectReason = ref('')

onMounted(async () => {
  await refresh()
})

async function refresh() {
  await fetchPendingPhotos()
  await fetchStats()
}

async function fetchPendingPhotos() {
  loading.value = true
  error.value = null

  try {
    const response = await ceoServices.getPendingPhotos()
    pendingPhotos.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar fotos pendientes'
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const response = await ceoServices.getPhotoStats()
    stats.value = response.data
  } catch (err: any) {
    console.error('Error fetching stats:', err)
  }
}

async function handleApprove(user: User) {
  if (!confirm(`¿Aprobar la foto de ${user.name}?`)) return

  processing.value = user.id
  error.value = null

  try {
    await ceoServices.approvePhoto(user.id)
    // Remover de la lista
    pendingPhotos.value = pendingPhotos.value.filter(u => u.id !== user.id)
    // Actualizar estadísticas
    if (stats.value) {
      stats.value.pending--
      stats.value.approved++
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al aprobar la foto'
  } finally {
    processing.value = null
  }
}

function handleReject(user: User) {
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

  processing.value = selectedUser.value.id
  error.value = null

  try {
    await ceoServices.rejectPhoto(
      selectedUser.value.id, 
      rejectReason.value || undefined
    )
    // Remover de la lista
    pendingPhotos.value = pendingPhotos.value.filter(
      u => u.id !== selectedUser.value!.id
    )
    // Actualizar estadísticas
    if (stats.value) {
      stats.value.pending--
      stats.value.rejected++
    }
    closeRejectModal()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al rechazar la foto'
  } finally {
    processing.value = null
  }
}

function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.photo-review {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  color: #333;
}

.btn-refresh {
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #5568d3;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
}

.stat-value {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: #333;
}

.stat-value.pending {
  color: #ff9800;
}

.stat-value.approved {
  color: #4caf50;
}

.stat-value.rejected {
  color: #f44336;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #c62828;
}

.btn-close {
  background: none;
  border: none;
  color: #c62828;
  font-size: 20px;
  cursor: pointer;
  padding: 0 10px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  color: #4caf50;
  margin-bottom: 20px;
}

.empty h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty p {
  margin: 0;
  color: #666;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.photo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-container {
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f0f0f0;
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  padding: 16px;
}

.user-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.email {
  margin: 0 0 8px 0;
  color: #667eea;
  font-size: 14px;
}

.date {
  margin: 0;
  color: #999;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px 16px;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-approve {
  background: #4caf50;
  color: white;
}

.btn-approve:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm-reject {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  opacity: 0.9;
}

.btn-confirm-reject {
  background: #f44336;
  color: white;
}

.btn-confirm-reject:hover {
  opacity: 0.9;
}
</style>
