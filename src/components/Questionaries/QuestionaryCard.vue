<template>
  <div class="stats-card">
    <div class="stats-header">
      <h5 class="stats-title">{{ questionary.title }}</h5>
      <span class="total-responses">
        <IconUsers :size="16" class="me-1" />
        {{ questionary.total_responses || 0 }} votos
      </span>
    </div>

    <div class="stats-body custom-scrollbar">
      <div
        v-for="option in questionary.questions"
        :key="option.id"
        class="stat-option"
      >
        <div class="d-flex justify-content-between align-items-start mb-1">
          <div class="d-flex align-items-start gap-2 flex-grow-1">
            <BFormRadio
              v-if="isUser"
              :model-value="selectedOptionId"
              :value="option.id"
              name="questionary-option"
              class="custom-radio mt-1"
              :disabled="!!questionary.user_response_id"
              @change="onVote(option.id!)"
            />
            <span class="option-text">{{ option.question }}</span>
          </div>

          <div class="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
            <span class="option-count">{{ option.counter || 0 }}</span>
            <BButton
              v-if="isAdmin"
              variant="link"
              size="sm"
              class="p-0 text-decoration-none text-info"
              @click="$emit('show-voters', option.id!)"
              v-b-tooltip.hover="'Ver votantes'"
            >
              <IconEye :size="16" />
            </BButton>
          </div>
        </div>
        <div class="progress-container">
          <div
            class="progress-bar"
            :style="{ width: `${option.percentage || 0}%` }"
          ></div>
        </div>
        <div class="text-end mt-1">
          <span class="option-percentage">{{ option.percentage || 0 }}%</span>
        </div>
      </div>
    </div>

    <div class="stats-footer">
      <div class="d-flex align-items-center text-muted small">
        <IconCalendar :size="14" class="me-1" />
        {{ formatDate(questionary.end_date) }}
      </div>
      <div v-if="questionary.user_response_id" class="text-info small mt-1">
        <IconCheck :size="14" class="me-1" />
        Ya has votado
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Questionary } from "@/views/ceo/views/questionaries/interface/questionaries.interface";
import { formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  questionary: {
    type: Object as PropType<Questionary>,
    required: true,
  },
  selectedOptionId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["vote", "show-voters"]);

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role_id === 1);
const isUser = computed(() => authStore.user?.role_id === 2);

const onVote = (optionId: number) => {
  emit("vote", props.questionary.id, optionId);
};
</script>

<style scoped>
.stats-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 217, 255, 0.4);
}

.stats-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.stats-title {
  color: #ffffff;
  font-weight: 700;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.4;
  word-break: break-word; /* Allow title to wrap */
  margin-right: 1rem;
}

.total-responses {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #00d9ff;
  white-space: nowrap;
  flex-shrink: 0;
}

.stats-body {
  padding: 1.25rem;
  flex-grow: 1;
  overflow-y: auto; /* Scroll if content overflows */
}

.stat-option {
  margin-bottom: 1.25rem;
}

.stat-option:last-child {
  margin-bottom: 0;
}

.option-text {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.95rem;
  word-break: break-word; /* Wrap long questions */
  line-height: 1.4;
}

.option-count {
  color: #94a3b8;
  font-size: 0.9rem;
}

.progress-container {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff 0%, #00b4d8 100%);
  border-radius: 4px;
  transition: width 1s ease-out;
}

.option-percentage {
  color: #00d9ff;
  font-size: 0.85rem;
  font-weight: 600;
}

.stats-footer {
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto; /* Push to bottom */
  flex-shrink: 0;
}

.text-muted {
  color: #94a3b8 !important;
}

/* Custom Radio Styling */
.custom-radio :deep(.form-check-input) {
  background-color: transparent;
  border-color: #00d9ff;
  cursor: pointer;
}

.custom-radio :deep(.form-check-input:checked) {
  background-color: #00d9ff;
  border-color: #00d9ff;
}

.custom-radio :deep(.form-check-input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
