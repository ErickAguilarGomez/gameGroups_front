<template>
  <div class="announcement-container">
    <div class="announcement-section" v-if="!isCollapsed">
    <div v-if="loading" class="announcement-loading">Cargando anuncios...</div>
    <div v-else-if="announcements.length === 0" class="announcement-empty">No hay anuncios</div>
    <div v-else class="carousel">
        <div class="media-wrapper">
          <template v-if="currentAnnouncement.is_video">
            <!-- show the video frame but disable inline controls; user will open in new tab via play button -->
            <video
              :src="currentAnnouncement.url"
              muted
              playsinline
              class="announcement-media"
              preload="metadata"
            />

            <!-- Play button overlay: clicking it opens the video in a new tab -->
            <button type="button" class="play-overlay" @click="openVideoInNewTab(currentAnnouncement.url)" aria-label="Reproducir anuncio">
              <IconPlayerPlay :size="26" />
            </button>
          </template>
          <template v-else>
            <img @click="openImagePreview" :src="currentAnnouncement.url" :alt="currentAnnouncement.title" class="announcement-media" />
          </template>
        </div>

        <!-- Controls below the media -->
        <div class="media-controls">
          <button type="button" @click="prev" class="control-btn" aria-label="Anterior">
            <IconChevronLeft :size="20"/>
          </button>
          <div class="indicators">
            <button
              v-for="(item, i) in announcements"
              type="button"
              :key="item.id"
              :class="['dot', { active: i === currentIndex }]"
              @click="goto(i)"
              aria-label="Ir a anuncio"
            ></button>
          </div>
          <button type="button" @click="next" class="control-btn" aria-label="Siguiente">
            <IconChevronRight :size="20"/>
          </button>
        </div>

        <div class="content-wrapper below">
          <h4 class="announcement-title">{{ currentAnnouncement.title }}</h4>
          <div class="announcement-dates column">
            <div class="date-item" v-if="currentAnnouncement.start_date">
              <small class="date-line">Inicio: {{ formatDate(currentAnnouncement.start_date) }}</small>
            </div>
            <div class="date-item" v-if="currentAnnouncement.end_date">
              <small class="date-line">Fin: {{ formatDate(currentAnnouncement.end_date) }}</small>
            </div>
          </div>
          <p class="announcement-description">{{ currentAnnouncement.description }}</p>
        </div>
    </div>
    <!-- Image preview modal -->
    <BModal v-model="imageOpen" title="Vista previa" size="lg" no-footer>
      <div class="text-center">
        <img v-if="currentAnnouncement.url" :src="currentAnnouncement.url" :alt="currentAnnouncement.title" class="img-fluid" />
      </div>
    </BModal>

    <!-- Video preview modal -->
    <BModal v-model="videoOpen" title="Vista previa" size="lg" no-footer>
      <div class="text-center">
        <video v-if="currentAnnouncement.url" :src="currentAnnouncement.url" controls autoplay playsinline class="img-fluid" />
      </div>
    </BModal>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, toRef, Ref } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement';
import { addPreloader, removePreloader } from '@/composables';

interface Announcement {
  id: number | string;
  title: string;
  description: string;
  url?: string;
  is_video?: number | boolean;
  start_date?: string | null;
  end_date?: string | null;
}

const props = defineProps<{ isCollapsed?: boolean }>();
const isCollapsed = toRef(props, 'isCollapsed');

const announcementStore = useAnnouncementStore();
const announcements = toRef(announcementStore, 'announcements') as unknown as Ref<Announcement[]>;
const loading = toRef(announcementStore, 'loading') as unknown as Ref<boolean>;
const currentIndex = ref(0);
let intervalId: number | undefined;
const imageOpen = ref(false);
const videoOpen = ref(false);

const currentAnnouncement = computed(() => announcements.value[currentIndex.value] || ({} as Announcement));


const resetAuto = () => {
  // restart the auto-advance timer
  clearAuto();
  startAuto();
};

const next = () => {
  if (!announcements.value.length) return;
  currentIndex.value = (currentIndex.value + 1) % announcements.value.length;
  resetAuto();
};

const prev = () => {
  if (!announcements.value.length) return;
  currentIndex.value = (currentIndex.value - 1 + announcements.value.length) % announcements.value.length;
  resetAuto();
};

const goto = (index: number) => {
  if (!announcements.value.length) return;
  currentIndex.value = index;
  resetAuto();
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    // show date + time in short format, prefer Spanish locale for clarity
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

const openImagePreview = () => {
  if (!currentAnnouncement.value?.url) return;
  imageOpen.value = true;
};

// open video URL in a new browser tab (used by play overlay)
const openVideoInNewTab = (url?: string) => {
  if (!url) return;
  try {
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    window.location.href = url;
  }
};

watch(isCollapsed, (val) => {
  // Pause cycling if collapsed (truthy) or undefined
  if (val) clearAuto(); else startAuto();
});

const startAuto = () => {
  clearAuto();
  intervalId = window.setInterval(() => {
    next();
  }, 5000);
};

const clearAuto = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};

onMounted(async () => {
  addPreloader();
  await announcementStore.fetchAnnouncements();
  if (announcements.value.length > 0) currentIndex.value = 0;
  startAuto();
  removePreloader();
});

onBeforeUnmount(() => {
  clearAuto();
});
</script>

<style scoped>
.announcement-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 2rem 1rem;
}

.announcement-section {
  padding: 1.5rem;
  margin: 0;
  max-width: 900px;
  width: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.announcement-section:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.announcement-loading, 
.announcement-empty {
  color: #94a3b8;
  font-size: 0.95rem;
  padding: 2rem;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.carousel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.media-wrapper {
  width: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: transform 0.3s ease;
}

.media-wrapper:hover {
  transform: scale(1.01);
}

.announcement-media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.5s ease;
}

.media-wrapper:hover .announcement-media {
  transform: scale(1.05);
}

.content-wrapper {
  color: #ffffff;
}

.content-wrapper.below {
  text-align: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
  border-radius: 12px;
}

.announcement-title {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  
  /* Prevent overflow */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
  max-width: 100%;
}

.announcement-dates {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.announcement-dates.column { 
  padding-top: 0.5rem;
}

.date-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-radius: 20px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.date-item:hover {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-1px);
}

.date-line {
  color: #e0e7ff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.announcement-description {
  color: #cbd5e1;
  margin: 0;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.01em;
  
  /* Prevent overflow with scrollable area */
  max-height: 120px;
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-word;
  padding-right: 0.5rem;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(96, 165, 250, 0.3) rgba(255, 255, 255, 0.05);
}

.announcement-description::-webkit-scrollbar {
  width: 6px;
}

.announcement-description::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.announcement-description::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.3);
  border-radius: 10px;
  transition: background 0.2s;
}

.announcement-description::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 165, 250, 0.5);
}

.media-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 0;
  margin-top: 0.5rem;
}

.play-overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 40px rgba(96, 165, 250, 0.4),
    0 0 0 4px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  border: none;
  color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.play-overlay:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 
    0 15px 50px rgba(96, 165, 250, 0.6),
    0 0 0 6px rgba(255, 255, 255, 0.15);
}

.play-overlay:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.control-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
}

.control-btn:hover {
  color: #60a5fa;
  transform: scale(1.15);
}

.control-btn:active {
  transform: scale(0.95);
}

.indicators {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.2);
}

.dot.active {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 
    0 0 12px rgba(96, 165, 250, 0.6),
    0 2px 8px rgba(96, 165, 250, 0.4);
  width: 24px;
  border-radius: 12px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .announcement-container {
    padding: 1.5rem 1rem;
  }
  
  .announcement-section {
    max-width: 800px;
  }
  
  .media-wrapper { 
    height: 500px; 
  }
}

@media (max-width: 900px) {
  .announcement-container {
    padding: 1rem 0.75rem;
  }
  
  .announcement-section {
    max-width: 100%;
    padding: 1rem;
  }
  
  .media-wrapper { 
    height: 420px; 
  }
  
  .announcement-description {
    max-height: 100px;
  }
  
  .date-item {
    padding: 0.35rem 0.75rem;
  }
  
  .date-line {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .announcement-container {
    padding: 0.75rem 0.5rem;
    min-height: 100vh;
  }
  
  .announcement-section {
    padding: 0.875rem;
    border-radius: 16px;
  }
  
  .media-wrapper { 
    height: 380px;
    border-radius: 12px;
  }
  
  .content-wrapper.below {
    padding: 0.75rem 1rem;
  }
  
  .announcement-description {
    max-height: 80px;
    font-size: 0.9rem;
  }
  
  .media-controls {
    padding: 0.5rem 0.75rem;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
  }
  
  .play-overlay {
    width: 56px;
    height: 56px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
  }
  
  .dot.active {
    width: 20px;
  }
  
  .announcement-dates {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 400px) {
  .announcement-container {
    padding: 0.5rem 0.25rem;
  }
  
  .announcement-section {
    padding: 0.75rem;
  }
  
  .media-wrapper { 
    height: 320px; 
  }
  
  .announcement-description {
    max-height: 60px;
  }
}
</style>
