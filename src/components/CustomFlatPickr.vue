<template>
  <flat-pickr
    v-bind="$attrs"
    :config="mergedConfig"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    class="form-control custom-flatpickr"
  />
</template>

<script setup lang="ts">
import flatPickr from "vue-flatpickr-component";
import { PropType, computed } from "vue";
import { Spanish } from "flatpickr/dist/l10n/es";

const props = defineProps({
  modelValue: {
    type: [String, Date, null] as PropType<string | Date | null>,
    default: null,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const defaultConfig = {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: Spanish,
  allowInput: true,
  disable: [
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    },
  ],
};

const mergedConfig = computed(() => ({
  ...defaultConfig,
  ...props.config,
}));
</script>

<style>
/* Flatpickr Customization - Global styles required as flatpickr appends to body */
.flatpickr-calendar {
  background: #1a1a2e !important;
  border: 1px solid rgba(0, 217, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}
.flatpickr-day {
  color: #e2e8f0 !important;
}
.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  color: #475569 !important;
  background: transparent !important;
  border-color: transparent !important;
  cursor: not-allowed;
}
.flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange,
.flatpickr-day.selected.inRange,
.flatpickr-day.startRange.inRange,
.flatpickr-day.endRange.inRange,
.flatpickr-day:hover,
.flatpickr-day:focus {
  background: #00d9ff !important;
  border-color: #00d9ff !important;
  color: #0f0f23 !important;
}
.flatpickr-months .flatpickr-month {
  background: #1a1a2e !important;
  color: #e2e8f0 !important;
  fill: #e2e8f0 !important;
}
.flatpickr-current-month .flatpickr-monthDropdown-months {
  background: #1a1a2e !important;
  color: #e2e8f0 !important;
}
.flatpickr-current-month
  .flatpickr-monthDropdown-months
  .flatpickr-monthDropdown-month {
  background: #1a1a2e !important;
  color: #e2e8f0 !important;
}
.flatpickr-current-month input.cur-year {
  color: #e2e8f0 !important;
  font-weight: 600;
}
.flatpickr-weekdays {
  background: #1a1a2e !important;
}
.flatpickr-weekday {
  color: #00d9ff !important;
}
.flatpickr-time {
  background: #1a1a2e !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.flatpickr-time input {
  background: #1a1a2e !important;
  color: #e2e8f0 !important;
}
.flatpickr-time .flatpickr-am-pm {
  color: #e2e8f0 !important;
}
.flatpickr-time .numInputWrapper span.arrowUp:after {
  border-bottom-color: #e2e8f0 !important;
}
.flatpickr-time .numInputWrapper span.arrowDown:after {
  border-top-color: #e2e8f0 !important;
}
.flatpickr-calendar.arrowTop:before,
.flatpickr-calendar.arrowTop:after {
  border-bottom-color: #1a1a2e !important;
}
.flatpickr-calendar.arrowBottom:before,
.flatpickr-calendar.arrowBottom:after {
  border-top-color: #1a1a2e !important;
}
.numInputWrapper span {
  border-color: rgba(255, 255, 255, 0.1);
}
.numInputWrapper span:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
