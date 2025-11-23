<template>
  <BModal
    v-model="visible"
    :title="isEdit ? 'Editar Grupo' : 'Crear Grupo'"
    size="md"
    centered
    header-bg-variant="dark"
    header-text-variant="light"
    no-footer
  >
    <BFormGroup label="Nombre del Grupo" label-for="group-name">
      <BFormInput
        id="group-name"
        v-model="group.name"
        placeholder="Ej: Equipo Alpha"
      />
    </BFormGroup>

    <BFormGroup label="Imagen del Grupo" label-for="group-image">
      <ImageUploader
        :initial-preview="preview || group.group_img_url"
        :disabled="uploading"
        @update:file="onFileUpdate"
        @update:preview="onPreviewUpdate"
      />
    </BFormGroup>

    <div class="modal-footer-custom">
      <BButton variant="primary" @click="submit" :disabled="uploading">
        <BSpinner v-if="uploading" small class="me-1" />
        <IconDeviceFloppy v-else :size="20" class="me-1" />
        {{ isEdit ? 'Actualizar' : 'Crear' }}
      </BButton>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PropType } from 'vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { groups } from '@/api/backendApi'
import { uploadToCloudinary } from '@/services/cloudinaryService'
import { useAlert } from '@/composables/useAlert'

const props = defineProps({
  modelValue: { type: Boolean as PropType<boolean>, required: true },
  initialGroup: { type: Object as PropType<any | null>, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const { toast } = useAlert()

const visible = ref(!!props.modelValue)
watch(() => props.modelValue, v => (visible.value = !!v))
watch(visible, v => emit('update:modelValue', v))

const group = ref({ name: '', group_img_url: '' } as any)
const file = ref<File | null>(null)
const preview = ref<string | null>(null)
const uploading = ref(false)

const isEdit = computed(() => !!props.initialGroup)

watch(() => props.initialGroup, (g) => {
  if (g) {
    group.value = { name: g.name || '', group_img_url: g.group_img_url || '' }
    preview.value = g.group_img_url || null
    file.value = null
  } else {
    group.value = { name: '', group_img_url: '' }
    preview.value = null
    file.value = null
  }
}, { immediate: true })

function onFileUpdate(f: File | null) {
  file.value = f
}
function onPreviewUpdate(p: string | null) {
  preview.value = p
  if (p) group.value.group_img_url = ''
}

async function submit() {
  try {
    if (file.value instanceof File) {
      uploading.value = true
      try {
        const url = await uploadToCloudinary(file.value)
        group.value.group_img_url = url
      } finally {
        uploading.value = false
      }
    }

    if (isEdit.value && props.initialGroup && props.initialGroup.id) {
      await groups.update(props.initialGroup.id, group.value)
      toast('Grupo actualizado', 'success')
    } else {
      await groups.create(group.value)
      toast('Grupo creado', 'success')
    }

    emit('saved')
    visible.value = false
  } catch (err: any) {
    toast(err?.message || 'Error al guardar grupo', 'error')
  }
}
</script>

<style scoped>
.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
