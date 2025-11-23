<template>
  <div class="image-uploader">
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onChange"
      :disabled="disabled"
    />

    <div class="d-flex align-items-center gap-2">
      <div v-if="previewSrc" class="image-preview position-relative">
        <img :src="previewSrc" alt="Preview" class="preview-image" />
        <div class="image-actions position-absolute m-0 d-flex gap-1">
          <button type="button" class="btn btn-outline-primary p-1" @click="triggerFileInput" :disabled="disabled">
            <IconUpload :size="16" />
          </button>
          <button type="button" class="btn btn-outline-danger p-1" @click="remove" :disabled="disabled">
            <IconTrash :size="16" />
          </button>
        </div>
      </div>

      <div v-else class="d-flex gap-2 align-items-center no-preview">
        <button type="button" class="btn btn-outline-primary p-1" @click="triggerFileInput" :disabled="disabled">
        Click Para Subir Imagen
        <IconUpload :size="16" class="ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ initialPreview?: string | null; disabled?: boolean }>()
const emit = defineEmits(['update:file', 'update:preview'])

const inputRef = ref<HTMLInputElement | null>(null)
const previewSrc = ref<string | null>(props.initialPreview ?? null)

watch(() => props.initialPreview, (v) => {
  previewSrc.value = v ?? null
})

function triggerFileInput() {
  inputRef.value?.click()
}

function onChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] || null
  emit('update:file', file)
  if (file) {
    const url = URL.createObjectURL(file)
    previewSrc.value = url
    emit('update:preview', url)
  } else {
    previewSrc.value = null
    emit('update:preview', null)
  }
}

function remove() {
  if (inputRef.value) inputRef.value.value = ''
  emit('update:file', null)
  previewSrc.value = null
  emit('update:preview', null)
}
</script>

<style scoped>
.image-preview {
  background: rgba(26, 26, 46, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
}
.preview-image {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
  object-fit: cover;
}
.image-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.no-preview {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
