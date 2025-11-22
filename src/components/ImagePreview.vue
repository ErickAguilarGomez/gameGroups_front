<template>
  <div class="image-preview" @click="open = true" :title="alt || 'Ver imagen'">
    <img
      v-if="src"
      :src="src"
      :alt="alt || 'imagen'"
      :style="thumbnailStyle as any"
      class="img-thumb"
    />
    <div v-else class="img-fallback">{{ initial }}</div>

    <BModal v-model="open" title="Vista previa" size="lg" no-footer>
      <div class="text-center">
        <img v-if="src" :src="src" :alt="alt || 'imagen'" class="img-fluid" />
        <div v-else class="img-large-fallback">{{ initial }}</div>
      </div>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  src?: string | null;
  alt?: string;
  initial?: string;
  size?: number;
}>();

const open = ref(false);

const thumbnailSize = computed(() => props.size ?? 40);

const thumbnailStyle = computed(() => ({
  width: `${thumbnailSize.value}px`,
  height: `${thumbnailSize.value}px`,
  objectFit: "cover",
  borderRadius: "50%",
}));
</script>

<style scoped>
.image-preview {
  display: inline-block;
  cursor: pointer;
}
.img-thumb {
  display: inline-block;
}
.img-fallback,
.img-large-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.img-large-fallback {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  font-size: 48px;
}
</style>
