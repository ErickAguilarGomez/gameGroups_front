<template>
  <BModal
    v-model="isVisible"
    title="Rechazar Foto"
    @ok="handleRejectPhoto"
  >
    <BFormGroup label="Razón del rechazo:" label-for="reject-reason">
      <BFormTextarea
        id="reject-reason"
        v-model="localReason"
        placeholder="Especifica por qué se rechaza la foto..."
        rows="4"
        required
      />
    </BFormGroup>
  </BModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ceoUserService } from '@/views/ceo/services/userService'
import type { User } from '@/types/user'
import { useAlert } from '@/composables/useAlert'

const { toast } = useAlert()

const props = defineProps<{
  modelValue: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'refresh': []
}>()

const localReason = ref('')

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(isVisible, (newValue) => {
  if (newValue) {
    localReason.value = ''
  }
})

const handleRejectPhoto = async () => {
  if (!props.user || !localReason.value.trim()) {
    toast('Debes especificar una razón para el rechazo', 'warning')
    return
  }

  try {
    await ceoUserService.rejectPhoto(props.user.id, localReason.value)
    isVisible.value = false
    toast('Foto rechazada exitosamente', 'success')
    emit('refresh')
  } catch (error) {
    console.error('Error al rechazar foto:', error)
    toast('Error al rechazar foto', 'error')
  }
}
</script>
