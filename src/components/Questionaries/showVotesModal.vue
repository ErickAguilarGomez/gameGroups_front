<template>
  <BModal
    v-model="isVisible"
    title="Usuarios que votaron"
    no-footer
    centered
    content-class="gamer-modal-content"
    header-class="gamer-modal-header"
    body-class="gamer-modal-body p-0"
  >
    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary" />
    </div>

    <div v-else-if="voters.length === 0" class="text-center py-5 text-muted">
      <div class="d-flex flex-column align-items-center">
        <IconUsers :size="48" class="mb-3 opacity-25" />
        <p class="mb-0">Nadie ha votado por esta opción aún.</p>
      </div>
    </div>

    <div v-else class="voters-list custom-scrollbar">
      <div v-for="user in voters" :key="user.id" class="voter-item">
        <div class="d-flex align-items-center flex-grow-1 min-w-0">
          <div class="avatar-placeholder me-3">
            <img
              v-if="user.photo_url"
              :src="user.photo_url"
              alt="User"
              class="avatar-img"
            />
            <span v-else class="avatar-text">
              {{ getInitials(user.name) }}
            </span>
          </div>
          <div class="user-info text-truncate">
            <h6 class="mb-0 fw-bold text-light text-truncate">
              {{ user.name }}
            </h6>
            <small class="text-light d-block">{{ user.email }}</small>
          </div>
        </div>
        <div class="vote-date ms-3">
          <small class="text-info">{{ formatDate(user.response_date) }}</small>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { questionariesService } from "@/views/ceo/views/questionaries/Service/questionaries.service";
import { formatDate } from "@/utils/formatters";
import { useAlert } from "@/composables/useAlert";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  questionId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);
const { toast } = useAlert();

const voters = ref<any[]>([]);
const loading = ref(false);

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const fetchVoters = async () => {
  if (!props.questionId) return;

  loading.value = true;
  voters.value = [];

  try {
    const data = await questionariesService.getUsersByOption({
      question_id: props.questionId,
    });
    voters.value = data;
  } catch (error) {
    console.error("Error fetching voters:", error);
    toast("Error al obtener votantes", "error");
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.questionId) {
      fetchVoters();
    }
  }
);
</script>

<style>
/* Global styles for the modal content to override Bootstrap defaults */
.gamer-modal-content {
  background: #1a1a2e !important;
  border: 1px solid rgba(0, 217, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5) !important;
  color: #fff !important;
}

.gamer-modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1.5rem !important;
}

.gamer-modal-header .modal-title {
  font-weight: 700;
  color: #fff;
}

.gamer-modal-header .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.gamer-modal-body {
  background: #1a1a2e !important;
}
</style>

<style scoped>
.voters-list {
  max-height: 400px;
  overflow-y: auto;
}

.voter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.voter-item:hover {
  background-color: rgba(0, 217, 255, 0.05);
}

.voter-item:last-child {
  border-bottom: none;
}

.avatar-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d9ff 0%, #00b4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: #0f0f23;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.user-info {
  min-width: 0;
}

.vote-date {
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 0.85rem;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
