<template>
  <BModal
    v-model="showModal"
    size="xl"
    no-footer
    title="Editar Encuesta"
    centered
    content-class="gamer-modal-content"
    header-class="gamer-modal-header"
    body-class="gamer-modal-body p-0"
    title-class="gamer-modal-title"
    @hide="emit('close')"
  >
    <CreateQuestionariForm :id="props.id" />
  </BModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CreateQuestionariForm from "@/views/ceo/views/questionaries/components/CreateQuestionariForm.vue";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const showModal = ref(true);
</script>
