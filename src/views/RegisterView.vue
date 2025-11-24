<template>
  <div class="register-container">
    <b-card class="register-card shadow-lg">
      <b-card-body class="p-4">
        <!-- Header -->
        <div class="text-center mb-4">
          <div class="register-icon mb-3">
            <IconUserPlus :size="60" :stroke-width="1.5" />
          </div>
          <h2 class="fw-bold">Crear Cuenta</h2>
          <p class="text-muted">Completa el formulario para registrarte</p>
        </div>

        <!-- Form -->
        <b-form @submit.prevent="handleSubmit">
          <!-- Foto de perfil -->
          <div class="text-center mb-4">
            <div class="photo-preview mx-auto mb-3">
              <img
                v-if="photoUrl"
                :src="photoUrl"
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
              <b-button
                variant="outline-primary"
                size="sm"
                @click="triggerFileInput"
                :disabled="uploading"
              >
                <b-spinner v-if="uploading" small class="me-2" />
                <IconUpload :size="18" class="me-1" v-if="!uploading" />
                {{ uploading ? "Subiendo..." : "Seleccionar Foto" }}
              </b-button>
              <b-button
                v-if="photoUrl"
                variant="outline-danger"
                size="sm"
                @click="removePhoto"
              >
                <IconTrash :size="18" class="me-1" />
                Quitar
              </b-button>
            </div>
          </div>

          <!-- Nombre -->
          <b-form-group label="Nombre Completo" label-for="name" class="mb-3">
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconUser :size="20" />
                </b-input-group-text>
              </template>
              <b-form-input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Tu nombre completo"
                required
              />
            </b-input-group>
          </b-form-group>

          <!-- Email -->
          <b-form-group
            label="Correo Electrónico"
            label-for="email"
            class="mb-3"
          >
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconMail :size="20" />
                </b-input-group-text>
              </template>
              <b-form-input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </b-input-group>
          </b-form-group>

          <!-- Fecha de nacimiento con Datepicker -->
          <b-form-group
            label="Fecha de Nacimiento"
            label-for="birthdate"
            class="mb-3"
          >
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconCalendar :size="20" />
                </b-input-group-text>
              </template>
              <flat-pickr
                v-model="form.birthdate"
                :config="dateConfig"
                class="form-control"
                placeholder="Selecciona tu fecha de nacimiento"
                required
              />
            </b-input-group>
          </b-form-group>

          <!-- Red Social (Opcional) -->
          <b-form-group
            label="Red Social (Opcional)"
            label-for="social_network"
            class="mb-3"
          >
            <div class="social-network-selector">
              <div
                v-for="network in socialNetworks"
                :key="network.id"
                :class="[
                  'social-option',
                  { active: form.social_network_id === network.id },
                ]"
                @click="selectSocialNetwork(network.id)"
              >
                <img
                  :src="network.logo_url"
                  :alt="network.name"
                  class="social-icon"
                />
                <span class="social-name">{{ network.name }}</span>
              </div>
            </div>
            <b-form-text>Selecciona dónde pueden encontrarte</b-form-text>
          </b-form-group>

          <!-- Nickname (Solo si seleccionó red social) -->
          <b-form-group
            v-if="form.social_network_id"
            label="Nickname"
            label-for="nickname"
            class="mb-3"
          >
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconAt :size="20" />
                </b-input-group-text>
              </template>
              <b-form-input
                id="nickname"
                v-model="form.nickname"
                type="text"
                placeholder="Tu usuario en la red social"
                :required="!!form.social_network_id"
              />
            </b-input-group>
            <b-form-text>
              Tu nickname en {{ getSelectedSocialNetworkName() }}
            </b-form-text>
          </b-form-group>

          <!-- País (Opcional) -->
          <b-form-group
            label="País (Opcional)"
            label-for="country"
            class="mb-3"
          >
            <CountrySelect
              v-model="form.country"
              v-model:modelSlug="form.country_slug"
            />
            <b-form-text
              >Tu país es opcional y se enviará al backend si lo
              seleccionas</b-form-text
            >
          </b-form-group>

          <!-- Contraseña -->
          <b-form-group label="Contraseña" label-for="password" class="mb-3">
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconLock :size="20" />
                </b-input-group-text>
              </template>
              <b-form-input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                required
                minlength="8"
              />
              <template #append>
                <b-button
                  variant="outline-secondary"
                  @click="showPassword = !showPassword"
                >
                  <IconEye v-if="!showPassword" :size="20" />
                  <IconEyeOff v-else :size="20" />
                </b-button>
              </template>
            </b-input-group>
            <b-form-text
              >La contraseña debe tener al menos 8 caracteres</b-form-text
            >
          </b-form-group>

          <!-- Confirmar Contraseña -->
          <b-form-group
            label="Confirmar Contraseña"
            label-for="password_confirmation"
            class="mb-3"
          >
            <b-input-group>
              <template #prepend>
                <b-input-group-text>
                  <IconLock :size="20" />
                </b-input-group-text>
              </template>
              <b-form-input
                id="password_confirmation"
                v-model="form.password_confirmation"
                :type="showPasswordConfirm ? 'text' : 'password'"
                placeholder="Repite tu contraseña"
                required
                minlength="8"
              />
              <template #append>
                <b-button
                  variant="outline-secondary"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                >
                  <IconEye v-if="!showPasswordConfirm" :size="20" />
                  <IconEyeOff v-else :size="20" />
                </b-button>
              </template>
            </b-input-group>
          </b-form-group>

          <!-- Error Alert -->
          <b-alert
            v-if="error"
            variant="danger"
            show
            dismissible
            @dismissed="error = null"
            class="mb-3"
          >
            <IconAlertCircle :size="20" class="me-2" />
            {{ error }}
          </b-alert>

          <!-- Success Alert -->
          <b-alert v-if="success" variant="success" show class="mb-3">
            <IconCheck :size="20" class="me-2" />
            {{ success }}
          </b-alert>

          <!-- Submit Button -->
          <b-button
            type="submit"
            variant="primary"
            size="lg"
            class="w-100 mb-3"
            :disabled="loading || uploading"
          >
            <b-spinner v-if="loading" small class="me-2" />
            <IconUserPlus :size="20" class="me-2" v-if="!loading" />
            {{ loading ? "Creando cuenta..." : "Crear Cuenta" }}
          </b-button>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-muted mb-0">
              ¿Ya tienes cuenta?
              <router-link to="/login" class="text-decoration-none fw-semibold">
                Inicia Sesión
              </router-link>
            </p>
          </div>
        </b-form>
      </b-card-body>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, cloudinary } from "@/api/backendApi";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es";
import backendApi from "@/api/backendApi";
import CountrySelect from "@/components/CountrySelect.vue";

interface SocialNetwork {
  id: number;
  name: string;
  logo_url: string;
}

const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  birthdate: "",
  social_network_id: null as number | null,
  nickname: "",
  country: null as string | null,
  country_slug: null as string | null,
});

const socialNetworks = ref<SocialNetwork[]>([]);
const photoUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const uploading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

// Configuración del datepicker
const dateConfig = {
  dateFormat: "Y-m-d",
  maxDate: "today",
  locale: Spanish,
  allowInput: true,
};

onMounted(async () => {
  try {
    const response = await backendApi.get("/api/social-networks");
    socialNetworks.value = response.data;
  } catch (err) {
    console.error("Error al cargar redes sociales:", err);
  }
});

function selectSocialNetwork(id: number) {
  // Si hace clic en la red ya seleccionada, la deselecciona
  if (form.value.social_network_id === id) {
    form.value.social_network_id = null;
    form.value.nickname = "";
  } else {
    form.value.social_network_id = id;
  }
}

function getSelectedSocialNetworkName() {
  const selected = socialNetworks.value.find(
    (n) => n.id === form.value.social_network_id
  );
  return selected?.name || "la red social";
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    error.value = "Solo se permiten archivos de imagen";
    return;
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    error.value = "La imagen no debe superar los 5MB";
    return;
  }

  await uploadToCloudinary(file);
}

async function uploadToCloudinary(file: File) {
  uploading.value = true;
  error.value = null;

  try {
    // Obtener firma del backend
    const signatureResponse = await cloudinary.getSignature("user_photos");
    const { signature, timestamp, api_key, cloud_name, folder } =
      signatureResponse.data;

    // Preparar FormData con los parámetros firmados
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    // Subir a Cloudinary con firma
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }

    const data = await response.json();
    photoUrl.value = data.secure_url;
  } catch (err: any) {
    error.value = err.message || "Error al subir la imagen a Cloudinary";
    console.error("Cloudinary upload error:", err);
  } finally {
    uploading.value = false;
  }
}

function removePhoto() {
  photoUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function handleSubmit() {
  error.value = null;
  success.value = null;

  // Validar contraseñas
  if (form.value.password !== form.value.password_confirmation) {
    error.value = "Las contraseñas no coinciden";
    return;
  }

  loading.value = true;

  try {
    await auth.csrf();
    // Resolve slug if user typed the country name manually
    await auth.csrf();

    const registerData: any = {
      ...form.value,
      photo_url: photoUrl.value || undefined,
    };

    if (!form.value.social_network_id) {
      delete registerData.social_network_id;
      delete registerData.nickname;
    }

    await auth.register(registerData);

    success.value =
      "✅ Cuenta creada exitosamente. Tu solicitud está pendiente de aprobación por un administrador.";

    form.value = {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      birthdate: "",
      social_network_id: null,
      nickname: "",
      country: null,
      country_slug: null,
    };
    photoUrl.value = null;

    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      error.value = Object.values(errors).flat().join(", ");
    } else {
      error.value = err.response?.data?.message || "Error al crear la cuenta";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.register-card {
  border: none;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
}

.register-icon {
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

:deep(.btn-outline-primary) {
  border-color: #667eea;
  color: #667eea;
}

:deep(.btn-outline-primary:hover) {
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

a {
  color: #667eea;
  transition: color 0.2s;
}

a:hover {
  color: #764ba2;
}

/* Selector de redes sociales */
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
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
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
