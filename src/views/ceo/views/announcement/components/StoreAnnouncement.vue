<template>
  <div class="store-announcement">
    <BCard no-body class="gamer-card">
      <BCardHeader class="gamer-card-header">
        <div class="d-flex align-items-center">
          <IconPlus :size="24" class="me-2 text-primary" />
          <h4 class="gamer-title mb-0">Crear Nuevo Anuncio</h4>
        </div>
      </BCardHeader>

      <BCardBody class="gamer-card-body">
        <Form ref="formRef" @submit="handleSubmit" class="announcement-form">
          <fieldset
            :disabled="isSubmitting || uploading"
            style="border: 0; padding: 0; margin: 0"
          >
            <!-- Título del anuncio -->
            <BRow class="mb-3">
              <BCol md="12">
                <p class="field-label">Título del Anuncio</p>
                <Field rules="required|min:3" name="title">
                  <template #default="{ field, errorMessage }">
                    <BFormInput
                      id="title"
                      v-bind="field"
                      v-model="form.title"
                      placeholder="Ingresa el título del anuncio"
                      :state="errorMessage ? false : null"
                      required
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                  </template>
                </Field>
                <div
                  v-if="isEditMode && originalUrl && !form.is_video"
                  class="mt-2"
                >
                  <small class="text-muted"
                    >Imagen actual:
                    <a :href="originalUrl" target="_blank" rel="noopener"
                      >Ver</a
                    ></small
                  >
                </div>
              </BCol>
            </BRow>

            <!-- Descripción -->
            <BRow class="mb-3">
              <BCol md="12">
                <p class="field-label">Descripción</p>
                <Field rules="max:1000" name="description">
                  <template #default="{ field, errorMessage }">
                    <BFormTextarea
                      id="description"
                      v-bind="field"
                      v-model="form.description"
                      placeholder="Describe el contenido del anuncio..."
                      rows="4"
                      :state="errorMessage ? false : null"
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                  </template>
                </Field>
              </BCol>
            </BRow>

            <!-- Fechas y tipo de anuncio en la misma fila -->
            <BRow class="mb-3">
              <BCol md="3">
                <p class="field-label">Fecha de Inicio</p>
                <Field :rules="startDateRules" name="start_date">
                  <template #default="{ field, errorMessage }">
                    <flat-pickr
                      id="start_date"
                      v-bind="field"
                      v-model="form.start_date"
                      :config="dateTimeConfigStart"
                      class="form-control"
                      placeholder="Selecciona fecha y hora de inicio"
                      :state="errorMessage ? false : null"
                      required
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                  </template>
                </Field>
              </BCol>

              <BCol md="3">
                <p class="field-label">Fecha de Fin</p>
                <Field :rules="endDateRules" name="end_date">
                  <template #default="{ field, errorMessage }">
                    <flat-pickr
                      id="end_date"
                      v-bind="field"
                      v-model="form.end_date"
                      :config="dateTimeConfigEnd"
                      class="form-control"
                      placeholder="Selecciona fecha y hora de fin"
                      :state="errorMessage ? false : null"
                      required
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                  </template>
                </Field>
              </BCol>

              <BCol md="6" class="d-flex align-items-center">
                <div>
                  <p class="field-label mb-2">Tipo de Anuncio</p>
                  <BFormCheckbox
                    id="is_video"
                    v-model="form.is_video"
                    class="custom-checkbox circular-checkbox"
                  >
                    <span class="checkbox-label">¿Video?</span>
                  </BFormCheckbox>
                </div>
              </BCol>
            </BRow>

            <!-- URL del video (solo si es video) -->
            <BRow v-if="form.is_video" class="mb-3">
              <BCol md="12">
                <p class="field-label">URL del Video</p>
                <Field rules="required|url" name="url">
                  <template #default="{ field, errorMessage }">
                    <BFormInput
                      id="url"
                      v-bind="field"
                      v-model="form.url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                      :state="errorMessage ? false : null"
                      required
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                    <small class="text-muted"
                      >Ingresa la URL completa del video (YouTube, Vimeo,
                      etc.)</small
                    >
                  </template>
                </Field>
              </BCol>
            </BRow>

            <!-- Imagen (solo si NO es video) -->
            <BRow v-if="!form.is_video" class="mb-4">
              <BCol md="12">
                <p class="field-label">Subir Imagen del Anuncio</p>
                <Field
                  :key="fileInputKey"
                  :rules="imageFieldRules"
                  name="image"
                >
                  <template #default="{ errorMessage }">
                    <div class="d-flex align-items-center gap-2">
                      <ImageUploader
                        :initial-preview="selectedImagePreview || originalUrl"
                        :disabled="isSubmitting || uploading"
                        @update:file="
                          (f) => {
                            form.image = f;
                          }
                        "
                        @update:preview="
                          (p) => {
                            selectedImagePreview = p;
                            if (p) originalUrl = null;
                          }
                        "
                      />
                    </div>
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                    <small class="text-muted"
                      >Formatos permitidos: JPG, PNG, GIF. Tamaño máximo:
                      5MB</small
                    >
                  </template>
                </Field>
              </BCol>
            </BRow>

            <!-- Botones -->
            <BRow>
              <BCol md="12">
                <div class="d-flex gap-2 justify-content-end">
                  <BButton
                    variant="outline-secondary"
                    @click="resetForm()"
                    :disabled="isSubmitting || uploading"
                  >
                    <IconX :size="16" class="me-1" />
                    Resetear Formulario
                  </BButton>

                  <BButton
                    variant="primary"
                    type="submit"
                    @click="handleSubmit"
                    :disabled="isSubmitting || uploading"
                  >
                    <BSpinner
                      v-if="isSubmitting || uploading"
                      small
                      class="me-1"
                    />
                    <IconCheck
                      v-if="!isSubmitting && !uploading"
                      :size="16"
                      class="me-1"
                    />
                    {{
                      isSubmitting || uploading
                        ? uploading
                          ? "Subiendo imagen..."
                          : isEditMode
                          ? "Actualizando..."
                          : "Creando..."
                        : isEditMode
                        ? "Actualizar Anuncio"
                        : "Crear Anuncio"
                    }}
                  </BButton>
                </div>
              </BCol>
            </BRow>
          </fieldset>
        </Form>
      </BCardBody>
    </BCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, PropType, nextTick } from "vue";
import ImageUploader from "@/components/ImageUploader.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es";
import { Form, Field } from "vee-validate";
import { useAlert } from "@/composables/useAlert";
import { announcementService } from "@/views/ceo/services/announcement";
import { addPreloader, removePreloader } from "@/composables/usePreloader";
import { useAnnouncementStore } from "@/stores/announcement";
import { useAuthStore } from "@/stores/authStore";
import { uploadToCloudinary } from '@/services/cloudinaryService'

// Props and Emits
const props = defineProps({
  id: { type: Number as PropType<number | null> },
});
const emit = defineEmits<{ (e: "refresh"): void }>();

//Servicio y toast
const { toast } = useAlert();
const authStore = useAuthStore();
const formRef = ref();
const fileInputNativeRef = ref<HTMLInputElement | null>(null);
let previousObjectUrl: string | null = null;
const fileInputKey = ref(0);

const dateTimeConfigStart = ref({
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: Spanish,
  allowInput: true,
  minDate: new Date(),
});

const dateTimeConfigEnd = ref({
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: Spanish,
  allowInput: true,
  minDate: new Date(),
});

//DATA
const isSubmitting = ref(false);
const uploading = ref(false);
const form = ref({
  title: "",
  description: "",
  url: "",
  start_date: null as Date | string | null,
  end_date: null as Date | string | null,
  is_active: true,
  is_video: false,
  image: null as File | null,
});
const originalUrl = ref<string | null>(null);
const selectedImagePreview = ref<string | null>(null);

//Computed
const isEditMode = computed(() => !!props.id);
const imageFieldRules = computed(() => () => {
  if (form.value.is_video) return "image";
  if (isEditMode.value && originalUrl.value) return "image";
  return "required|image";
});

//MOUNTED
onMounted(() => {
  if (props.id) {
    void fetchAnnouncementById(props.id);
  }
});

async function fetchAnnouncementById(id?: number | null) {
  if (!id) return;
  try {
    const response = await announcementService.showAnnouncement({ id });
    const data = response.data || response;
    const isVideoUrl = (data.url || "")
      .toString()
      .match(/youtube|vimeo|youtu\.be|vimeo\.com/i);

    const startDateVal = parseDate(data.start_date);
    const endDateVal = parseDate(data.end_date);

    form.value = {
      title: data.title || "",
      description: data.description || "",
      url: data.url || "",
      start_date: startDateVal || "",
      end_date: endDateVal || "",
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_video:
        data.is_video !== undefined ? Boolean(data.is_video) : !!isVideoUrl,
      image: null,
    };
    originalUrl.value = form.value.is_video ? null : data.url || null;
    selectedImagePreview.value = originalUrl.value;
    if (startDateVal) {
      dateTimeConfigEnd.value.minDate = startDateVal;
    }
    try {
      await nextTick();
      if (formRef.value?.setValues) {
        formRef.value.setValues(
          {
            title: form.value.title,
            description: form.value.description,
            url: form.value.url,
            start_date: form.value.start_date,
            end_date: form.value.end_date,
            is_active: form.value.is_active,
            is_video: form.value.is_video,
            image: null,
          },
          true
        );
      }
    } catch (err) {
      console.warn("Could not set formRef values", err);
    }
  } catch (err) {
    console.error("Error loading announcement:", err);
    toast("Error al cargar el anuncio", "error");
  }
}

const startDateRules = (value: unknown) => {
  const v = value as string | Date | null;
  if (!v) return "La fecha de inicio es requerida";
  const date = v instanceof Date ? v : new Date(v as string);
  if (isNaN(date.getTime())) return "Fecha de inicio inválida";
  const now = new Date();
  if (date < now)
    return "La fecha de inicio no puede ser anterior a la fecha/hora actual";
  return true;
};

const endDateRules = (value: unknown) => {
  const v = value as string | Date | null;
  if (!v) return "La fecha de fin es requerida";
  const end = v instanceof Date ? v : new Date(v as string);
  if (isNaN(end.getTime())) return "Fecha de fin inválida";
  const startVal = form.value.start_date;
  if (!startVal) return "Selecciona la fecha de inicio primero";
  const start =
    startVal instanceof Date ? startVal : new Date(startVal as string);
  if (isNaN(start.getTime())) return "Fecha de inicio inválida";
  if (end <= start)
    return "La fecha de fin debe ser mayor que la fecha de inicio";
  return true;
};

function updateFile(file: File | null) {
  form.value.image = file;
  if (previousObjectUrl) {
    try {
      URL.revokeObjectURL(previousObjectUrl);
    } catch (e) {}
    previousObjectUrl = null;
  }
  if (file) {
    const url = URL.createObjectURL(file);
    selectedImagePreview.value = url;
    previousObjectUrl = url;
    originalUrl.value = null;
  } else {
    selectedImagePreview.value = null;
  }
}

function updatePreview(preview: string | null) {
  if (previousObjectUrl && preview !== previousObjectUrl) {
    try {
      URL.revokeObjectURL(previousObjectUrl);
    } catch (e) {}
    previousObjectUrl = null;
  }
  selectedImagePreview.value = preview;
  if (preview) originalUrl.value = null;
}

function formatAsBackendDate(date: Date) {
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

const parseDate = (val: string | null | undefined) => {
  if (!val) return null;
  const iso = val.includes(" ") ? val.replace(" ", "T") : val;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};


const resetForm = async () => {
  form.value = {
    title: "",
    description: "",
    url: "",
    start_date: "",
    end_date: "",
    is_active: true,
    is_video: false,
    image: null,
  };
  fileInputKey.value++;
  if (previousObjectUrl) {
    try {
      URL.revokeObjectURL(previousObjectUrl);
    } catch (e) {}
    previousObjectUrl = null;
  }
  selectedImagePreview.value = null;
  originalUrl.value = null;
  formRef.value?.resetForm();
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  addPreloader();

  try {
    let finalUrl = "";
    if (!form.value.is_video && !originalUrl.value && !form.value.image) {
      toast("Debes subir una imagen o seleccionar un video", "error");
      isSubmitting.value = false;
      removePreloader();
      return;
    }
    if (form.value.is_video && !form.value.url) {
      toast("Debes ingresar la URL del video", "error");
      isSubmitting.value = false;
      removePreloader();
      return;
    }

    if (form.value.is_video) {
      finalUrl = form.value.url;
    } else {
      if (form.value.image && (form.value.image as File) instanceof File) {
        uploading.value = true;
        try {
          finalUrl = await uploadToCloudinary(form.value.image as File);
        } finally {
          uploading.value = false;
        }
      } else {
        finalUrl = originalUrl.value || "";
      }
    }
    const announcementData: any = {
      title: form.value.title,
      description: form.value.description || "",
      start_date:
        typeof form.value.start_date === "string" || !form.value.start_date
          ? form.value.start_date
          : formatAsBackendDate(form.value.start_date as Date),
      end_date:
        typeof form.value.end_date === "string" || !form.value.end_date
          ? form.value.end_date
          : formatAsBackendDate(form.value.end_date as Date),
      user_id: authStore.currentUser?.id || "",
      url: finalUrl,
    };

    // prepare payload
    announcementData.is_video = form.value.is_video ? 1 : 0;
    if (isEditMode.value && props.id) {
      announcementData.id = props.id;
      await announcementService.updateAnnouncement(announcementData);
      toast("Anuncio actualizado exitosamente", "success");
      // refresh central announcements store so other UI updates automatically
      try {
        await useAnnouncementStore().fetchAnnouncements();
      } catch (e) {}
      emit("refresh");
    } else {
      await announcementService.createAnnouncement(announcementData);
      toast("Anuncio creado exitosamente", "success");
      try {
        await useAnnouncementStore().fetchAnnouncements();
      } catch (e) {}
    }
    await resetForm();
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error al crear el anuncio";
    toast(errorMessage, "error");
  } finally {
    isSubmitting.value = false;
    removePreloader();
  }
};

defineExpose({ updateFile, updatePreview });

//WATCHERS
watch(
  () => form.value.start_date,
  (newStart) => {
    if (newStart) {
      const d = new Date(newStart);
      if (!isNaN(d.getTime())) {
        dateTimeConfigEnd.value.minDate = d;
      }
    } else {
      dateTimeConfigEnd.value.minDate = new Date();
    }
  }
);

watch(
  () => form.value.is_video,
  (isVideo) => {
    if (isVideo) {
      form.value.image = null;
      if (fileInputNativeRef.value) fileInputNativeRef.value.value = "";
      if (previousObjectUrl) {
        try {
          URL.revokeObjectURL(previousObjectUrl);
        } catch (e) {}
        previousObjectUrl = null;
      }
      selectedImagePreview.value = null;
      originalUrl.value = null;
    }
  }
);
</script>

<style scoped>
.store-announcement {
  padding: 2rem;
  background: #0f0f23;
  min-height: 100vh;
}

.gamer-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.gamer-card-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid rgba(0, 217, 255, 0.3);
  padding: 1.5rem;
}

.gamer-title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.gamer-card-body {
  background: #0f0f23;
  padding: 1.5rem;
}

.field-label {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.announcement-form .form-control,
.announcement-form .form-select {
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.announcement-form .form-control:focus,
.announcement-form .form-select:focus {
  background: rgba(26, 26, 46, 0.8);
  border-color: #00d9ff;
  box-shadow: 0 0 0 0.2rem rgba(0, 217, 255, 0.25);
  color: #e2e8f0;
}

.announcement-form .form-control[size="sm"] {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.25rem;
}

.announcement-form .form-control::placeholder {
  color: #64748b;
}

.custom-checkbox .checkbox-label {
  color: #ffffff;
  font-weight: 500;
  margin-left: 0.5rem;
}

.circular-checkbox
  .custom-control-input:checked
  ~ .custom-control-label::before {
  background-color: #00d9ff;
  border-color: #00d9ff;
}

.circular-checkbox .custom-control-label::before {
  border-radius: 50% !important;
  width: 1.2rem;
  height: 1.2rem;
}

.circular-checkbox .custom-control-label::after {
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  top: 0.2rem;
  left: -1.8rem;
  background-size: 0.6rem;
}

.image-preview {
  background: rgba(26, 26, 46, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.image-preview h6 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.image-preview.position-relative {
  position: relative;
}
.image-actions {
  display: flex;
  gap: 6px;
}

.btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

.btn-outline-secondary {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

.btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #e2e8f0;
}

.text-muted {
  color: #ffffff !important;
  font-size: 0.9rem !important;
  opacity: 0.9;
}

.announcement-form small {
  font-size: 0.9rem !important;
  line-height: 1.4;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
