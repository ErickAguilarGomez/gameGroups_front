<template>
  <BModal v-model="isVisible" title="Editar Usuario" @ok="handleUpdateUser">
    <BFormGroup label="Nombre:" label-for="edit-name">
      <BFormInput id="edit-name" v-model="localForm.name" required />
    </BFormGroup>

    <BFormGroup label="Email:" label-for="edit-email">
      <BFormInput
        id="edit-email"
        v-model="localForm.email"
        type="email"
        required
      />
    </BFormGroup>

    <BFormGroup label="Nueva Contraseña:" label-for="edit-password">
      <BFormInput
        id="edit-password"
        v-model="localForm.password"
        type="password"
        placeholder="Dejar en blanco para no cambiar"
      />
    </BFormGroup>
  </BModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { assistantUserService } from "@/views/assistant/services/userService";
import type { User } from "@/interfaces";
import { useAlert } from "@/composables/useAlert";

const { toast } = useAlert();

// Props
const props = defineProps<{
  modelValue: boolean;
  user: User | null;
}>();

// Emits - Ambos están siendo usados en el componente padre
const emit = defineEmits<{
  "update:modelValue": [value: boolean]; // Usado para cerrar el modal (v-model)
  refresh: []; // Usado para refrescar la lista después de editar
}>();

// State
interface EditUserForm {
  name: string;
  email: string;
  password: string;
}

const localForm = ref<EditUserForm>({
  name: "",
  email: "",
  password: "",
});

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Watchers
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      localForm.value = {
        name: newUser.name,
        email: newUser.email,
        password: "",
      };
    }
  },
  { immediate: true }
);

// Methods
const handleUpdateUser = async () => {
  if (!props.user) return;

  try {
    const updateData: Partial<EditUserForm> = {
      name: localForm.value.name,
      email: localForm.value.email,
    };

    if (localForm.value.password) {
      updateData.password = localForm.value.password;
    }

    await assistantUserService.updateUser(props.user.id, updateData);
    isVisible.value = false;
    toast("Usuario actualizado exitosamente", "success");
    emit("refresh");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    toast("Error al actualizar usuario", "error");
  }
};
</script>
