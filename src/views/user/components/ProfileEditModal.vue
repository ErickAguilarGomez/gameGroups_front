<template>
  <BModal
    v-model="isOpen"
    centered
    size="lg"
    hide-header
    no-footer
    header-class="b-0"
    body-class="p-0"
    max-height="50vh"
    scrollable
    @hidden="resetForm"
  >
    <div class="modal-content-wrapper">
      <!-- Header -->
      <div class="text-center mb-4">
        <div class="edit-icon mb-3">
          <IconUserEdit :size="60" :stroke-width="1.5" />
        </div>
        <h2 class="fw-bold">Editar Perfil</h2>
        <p class="text-muted">Actualiza tu información personal</p>
      </div>

      <!-- Form -->
      <BForm @submit.prevent="saveProfile">
        <!-- Foto de perfil -->
        <div class="text-center mb-4">
          <div class="photo-preview mx-auto mb-3">
            <img 
              v-if="photoPreview" 
              :src="photoPreview" 
              alt="Preview" 
              class="preview-image"
            />
            <div v-else class="preview-placeholder">
              <IconCamera :size="40" />
              <p class="mb-0 mt-2 small text-muted">Sin foto</p>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept="image/*"
            class="d-none"
          />
          <div class="d-flex gap-2 justify-content-center">
            <BButton 
              variant="outline-primary" 
              size="sm"
              @click="triggerFileInput" 
              :disabled="userStore.isUploading"
            >
              <BSpinner v-if="userStore.isUploading" small class="me-2" />
              <IconUpload :size="18" class="me-1" v-if="!userStore.isUploading" />
              {{ userStore.isUploading ? 'Subiendo...' : 'Seleccionar Foto' }}
            </BButton>
            <BButton
              v-if="photoPreview && photoPreview !== authStore.currentUser?.photo_url"
              variant="outline-danger"
              size="sm"
              @click="removePhoto"
            >
              <IconTrash :size="18" class="me-1" />
              Quitar
            </BButton>
          </div>
        </div>

        <!-- Nombre -->
        <BFormGroup label="Nombre Completo" label-for="name" class="mb-3">
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconUser :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Tu nombre completo"
              required
            />
          </BInputGroup>
        </BFormGroup>

        <!-- Email (disabled) -->
        <BFormGroup label="Correo Electrónico" label-for="email" class="mb-3">
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconMail :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="email"
              v-model="form.email"
              type="email"
              disabled
            />
          </BInputGroup>
          <BFormText>El correo electrónico no se puede modificar</BFormText>
        </BFormGroup>

        <!-- Fecha de nacimiento -->
        <BFormGroup label="Fecha de Nacimiento" label-for="birthdate" class="mb-3">
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconCalendar :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="birthdate"
              v-model="form.birthdate"
              type="date"
            />
          </BInputGroup>
        </BFormGroup>

        <!-- Red Social -->
        <BFormGroup label="Red Social (Opcional)" label-for="social_network" class="mb-3">
          <div class="social-network-selector">
            <div 
              v-for="network in socialNetworks" 
              :key="network.id"
              :class="['social-option', { active: form.social_network_id === network.id }]"
              @click="selectSocialNetwork(network.id)"
            >
              <img :src="network.logo_url" :alt="network.name" class="social-icon" />
              <span class="social-name">{{ network.name }}</span>
            </div>
          </div>
          <BFormText>Selecciona dónde pueden encontrarte</BFormText>
        </BFormGroup>

        <!-- Nickname (Solo si seleccionó red social) -->
        <BFormGroup 
          v-if="form.social_network_id" 
          label="Nickname" 
          label-for="nickname" 
          class="mb-3"
        >
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconAt :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="nickname"
              v-model="form.nickname"
              type="text"
              placeholder="Tu usuario en la red social"
              :required="!!form.social_network_id"
            />
          </BInputGroup>
          <BFormText>
            Tu nickname en {{ getSelectedSocialNetworkName() }}
          </BFormText>
        </BFormGroup>

        <!-- Contraseña (Opcional) -->
        <BFormGroup label="Nueva Contraseña (Opcional)" label-for="password" class="mb-3">
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconLock :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Dejar en blanco para no cambiar"
              minlength="8"
            />
            <template #append>
              <BButton variant="outline-secondary" @click="showPassword = !showPassword">
                <IconEye v-if="!showPassword" :size="20" />
                <IconEyeOff v-else :size="20" />
              </BButton>
            </template>
          </BInputGroup>
          <BFormText>Mínimo 8 caracteres. Dejar vacío para mantener la actual</BFormText>
        </BFormGroup>

        <!-- Confirmar Contraseña -->
        <BFormGroup 
          v-if="form.password" 
          label="Confirmar Nueva Contraseña" 
          label-for="password_confirmation" 
          class="mb-3"
        >
          <BInputGroup>
            <template #prepend>
              <BInputGroupText>
                <IconLock :size="20" />
              </BInputGroupText>
            </template>
            <BFormInput
              id="password_confirmation"
              v-model="form.password_confirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="Confirma tu nueva contraseña"
              minlength="8"
            />
            <template #append>
              <BButton variant="outline-secondary" @click="showPasswordConfirm = !showPasswordConfirm">
                <IconEye v-if="!showPasswordConfirm" :size="20" />
                <IconEyeOff v-else :size="20" />
              </BButton>
            </template>
          </BInputGroup>
        </BFormGroup>

        <!-- Error Alert -->
        <BAlert v-if="userStore.currentError" variant="danger" show dismissible @dismissed="userStore.clearError()" class="mb-3">
          <IconAlertCircle :size="20" class="me-2" />
          {{ userStore.currentError }}
        </BAlert>

        <!-- Success Alert -->
        <BAlert v-if="successMessage" variant="success" show class="mb-3">
          <IconCheck :size="20" class="me-2" />
          {{ successMessage }}
        </BAlert>

        <!-- Action Buttons -->
        <div class="d-flex gap-2">
          <BButton
            type="submit"
            variant="primary"
            size="lg"
            class="flex-fill"
            :disabled="userStore.isLoading || userStore.isUploading"
          >
            <BSpinner v-if="userStore.isLoading" small class="me-2" />
            <IconDeviceFloppy :size="20" class="me-2" v-if="!userStore.isLoading" />
            {{ userStore.isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </BButton>
        </div>
      </BForm>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useUserStore } from '@/views/user/store/userStore'
import { useAuthStore } from '@/stores'
import backendApi from '@/api/backendApi'
import type { SocialNetwork } from '@/interfaces/models'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const authStore = useAuthStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  name: '',
  email: '',
  social_network_id: null as number | null,
  nickname: '',
  birthdate: '',
  password: '',
  password_confirmation: '',
})

const photoPreview = ref<string | null>(null)
const uploadedPhotoUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const socialNetworks = ref<SocialNetwork[]>([])
const successMessage = ref<string | null>(null)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

onMounted(async () => {
  await loadSocialNetworks()
  loadUserData()
})

async function loadSocialNetworks() {
  try {
    const response = await backendApi.get('/api/social-networks')
    socialNetworks.value = response.data
  } catch (error) {
    console.error('Error al cargar redes sociales:', error)
  }
}

function loadUserData() {
  const user = authStore.currentUser
  if (user) {
    form.value = {
      name: user.name || '',
      email: user.email || '',
      social_network_id: user.social_network_id || null,
      nickname: user.nickname || '',
      birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
      password: '',
      password_confirmation: '',
    }
    photoPreview.value = user.photo_url || null
    uploadedPhotoUrl.value = null
  }
}

watch(() => authStore.currentUser, () => {
  loadUserData()
}, { immediate: true })

// Recargar datos cuando se abre el modal
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadUserData()
  }
})

function selectSocialNetwork(id: number) {
  if (form.value.social_network_id === id) {
    form.value.social_network_id = null
    form.value.nickname = ''
  } else {
    form.value.social_network_id = id
  }
}

function getSelectedSocialNetworkName() {
  const selected = socialNetworks.value.find(n => n.id === form.value.social_network_id)
  return selected?.name || 'la red social'
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const url = await userStore.uploadPhoto(file)
  
  if (url) {
    uploadedPhotoUrl.value = url
    photoPreview.value = url
  }
}

function removePhoto() {
  uploadedPhotoUrl.value = null
  photoPreview.value = authStore.currentUser?.photo_url || null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function saveProfile() {
  successMessage.value = null
  userStore.clearError()

  // Validar contraseñas si se está cambiando
  if (form.value.password) {
    if (form.value.password.length < 8) {
      userStore.error = 'La contraseña debe tener al menos 8 caracteres'
      return
    }
    if (form.value.password !== form.value.password_confirmation) {
      userStore.error = 'Las contraseñas no coinciden'
      return
    }
  }

  try {
    const updateData: any = {
      name: form.value.name,
      nickname: form.value.nickname || null,
      birthdate: form.value.birthdate || null,
      social_network_id: form.value.social_network_id,
    }

    // Incluir foto si fue cargada
    if (uploadedPhotoUrl.value) {
      updateData.photo_url = uploadedPhotoUrl.value
    }

    // Incluir contraseña si fue cambiada
    if (form.value.password) {
      updateData.password = form.value.password
      updateData.password_confirmation = form.value.password_confirmation
    }

    const result = await userStore.updateProfile(updateData)

    if (result.success) {
      // Recargar datos del usuario desde el backend
      await authStore.fetchUser()
      
      successMessage.value = '✅ Perfil actualizado correctamente'
      emit('updated')
      
      setTimeout(() => {
        isOpen.value = false
      }, 1500)
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
  }
}

function resetForm() {
  photoPreview.value = authStore.currentUser?.photo_url || null
  uploadedPhotoUrl.value = null
  successMessage.value = null
  userStore.clearError()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.modal-content-wrapper {
  padding: 2rem;
}

.edit-icon {
  color: #667eea;
}

.photo-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  text-align: center;
  color: #adb5bd;
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

:deep(.form-control:disabled) {
  background-color: #f8f9fa;
  opacity: 0.7;
}

:deep(.btn-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 600;
  transition: transform 0.2s;
  padding: 0.75rem;
  font-size: 1.05rem;
}

:deep(.btn-primary:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

:deep(.btn-primary:disabled) {
  opacity: 0.7;
}

:deep(.btn-secondary) {
  font-weight: 600;
  padding: 0.75rem;
  font-size: 1.05rem;
}

:deep(.btn-outline-primary) {
  border-color: #667eea;
  color: #667eea;
}

:deep(.btn-outline-primary:hover:not(:disabled)) {
  background-color: #667eea;
  border-color: #667eea;
}

:deep(.btn-outline-danger) {
  border-color: #dc3545;
  color: #dc3545;
}

:deep(.btn-outline-danger:hover) {
  background-color: #dc3545;
  border-color: #dc3545;
}

.social-network-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  padding: 0.5rem;
}

.social-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.social-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
}

.social-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.social-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.social-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.social-option.active .social-name {
  color: #667eea;
}
</style>
