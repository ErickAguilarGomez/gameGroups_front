<template>
  <BModal
    v-model="isVisible"
    title="Banear Usuario del Grupo"
    centered
    header-bg-variant="danger"
    header-text-variant="light"
    @hidden="handleClose"
  >
    <div class="ban-modal-content">
      <div class="warning-section">
        <IconAlertTriangle :size="48" class="warning-icon" />
        <p class="warning-text">
          ¿Estás seguro de que deseas banear a <strong>{{ user?.name }}</strong>?
        </p>
        <p class="warning-subtext">
          El usuario será removido del grupo y no podrá ser asignado nuevamente hasta que sea desbaneado.
        </p>
      </div>

      <BFormGroup label="Motivo del Baneo *" label-for="ban-reason">
        <BFormTextarea
          id="ban-reason"
          v-model="banReason"
          placeholder="Explica el motivo del baneo..."
          rows="4"
          :state="banReason.trim().length > 0 ? true : false"
        />
        <BFormInvalidFeedback :state="banReason.trim().length > 0">
          El motivo del baneo es obligatorio
        </BFormInvalidFeedback>
      </BFormGroup>
    </div>

    <template #footer>
      <div class="modal-footer-actions">
        <BButton variant="secondary" @click="handleClose">
          Cancelar
        </BButton>
        <BButton 
          variant="danger" 
          @click="handleBan"
          :disabled="banReason.trim().length === 0"
        >
          <IconBan :size="20" />
          Banear Usuario
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BModal, BButton, BFormGroup, BFormTextarea, BFormInvalidFeedback } from 'bootstrap-vue-next'
import { IconAlertTriangle, IconBan } from '@tabler/icons-vue'

interface User {
  id: number
  name: string
  email: string
}

interface Props {
  modelValue: boolean
  user: User | null
  groupId: number | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'ban', data: { userId: number, groupId: number, banReason: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const banReason = ref('')

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    banReason.value = ''
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  banReason.value = ''
}

const handleBan = () => {
  if (props.user && props.groupId && banReason.value.trim()) {
    emit('ban', {
      userId: props.user.id,
      groupId: props.groupId,
      banReason: banReason.value.trim()
    })
    handleClose()
  }
}
</script>

<style scoped>
.ban-modal-content {
  padding: 1rem 0;
}

.warning-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 12px;
  border: 2px solid #fca5a5;
}

.warning-icon {
  color: #ef4444;
  margin-bottom: 1rem;
}

.warning-text {
  font-size: 1.125rem;
  color: #991b1b;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.warning-text strong {
  color: #7f1d1d;
}

.warning-subtext {
  font-size: 0.875rem;
  color: #b91c1c;
  margin: 0;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

:deep(.btn-danger) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
