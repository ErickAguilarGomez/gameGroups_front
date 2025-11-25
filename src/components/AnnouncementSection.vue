<template>
  <div class="announcement-container">
    <div class="announcement-section" v-if="!isCollapsed">
      <div v-if="loading" class="announcement-loading">Cargando anuncios...</div>
      <div v-else-if="announcements.length === 0" class="announcement-empty">No hay anuncios</div>
      <div v-else class="carousel">
        
        <!-- Header: Title and Dates Centered -->
        <div class="carousel-header">
          <h4 class="announcement-title">{{ currentAnnouncement.title }}</h4>
          <div class="announcement-dates">
            <div class="date-item" v-if="currentAnnouncement.start_date">
              <small class="date-line">Inicio: {{ formatDate(currentAnnouncement.start_date) }}</small>
            </div>
            <div class="date-item" v-if="currentAnnouncement.end_date">
              <small class="date-line">Fin: {{ formatDate(currentAnnouncement.end_date) }}</small>
            </div>
          </div>
        </div>

        <!-- Media Container: 80% width, max 70vh height, arrows inside -->
        <div class="media-container-outer">
          <div class="media-container">
            <!-- Left Arrow -->
            <button type="button" @click="prev" class="control-btn control-left" aria-label="Anterior">
              <IconChevronLeft :size="32"/>
            </button>

            <!-- Media Content -->
            <div class="media-content">
              <template v-if="currentAnnouncement.is_video">
                <video
                  :src="currentAnnouncement.url"
                  muted
                  playsinline
                  class="announcement-media"
                  preload="metadata"
                />
                <button type="button" class="play-overlay" @click="openVideoInNewTab(currentAnnouncement.url)" aria-label="Reproducir anuncio">
                  <IconPlayerPlay :size="40" />
                </button>
              </template>
              <template v-else>
                <img :src="currentAnnouncement.url" :alt="currentAnnouncement.title" class="announcement-media" />
              </template>
            </div>

            <!-- Right Arrow -->
            <button type="button" @click="next" class="control-btn control-right" aria-label="Siguiente">
              <IconChevronRight :size="32"/>
            </button>
          </div>
        </div>

        <!-- Indicators and Description -->
        <div class="carousel-footer">
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
          <p class="announcement-description">{{ currentAnnouncement.description }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, toRef, Ref } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement';
import { addPreloader, removePreloader } from '@/composables';
import { IconChevronLeft, IconChevronRight, IconPlayerPlay } from '@tabler/icons-vue';

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

const currentAnnouncement = computed(() => announcements.value[currentIndex.value] || ({} as Announcement));


const resetAuto = () => {
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

const openVideoInNewTab = (url?: string) => {
  if (!url) return;
  try {
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    window.location.href = url;
  }
};

watch(isCollapsed, (val) => {
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
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #0f172a; /* Dark background to match theme */
  padding: 1rem;
}

.announcement-section {
  width: 100%;
  max-width: 1400px; /* Limit max width for very large screens */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.announcement-loading, 
.announcement-empty {
  color: #94a3b8;
  font-size: 1.2rem;
  text-align: center;
  padding: 2rem;
}

.carousel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* Header Styles */
.carousel-header {
  text-align: center;
  z-index: 10;
}

.announcement-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
}

.announcement-dates {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-item {
  padding: 0.4rem 1rem;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.date-line {
  color: #e0e7ff;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Media Container Styles */
.media-container-outer {
  display: flex;
  justify-content: center;
  width: 100%;
}

.media-container {
  position: relative;
  width: 80%; /* Requested width */
  height: 70vh; /* Requested max height */
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.media-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.announcement-media {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Ensure image is fully visible */
  display: block;
}

/* Controls (Arrows) */
.control-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(96, 165, 250, 0.6);
  transform: translateY(-50%) scale(1.1);
}

.control-left {
  left: 1rem;
}

.control-right {
  right: 1rem;
}

/* Play Overlay */
.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(96, 165, 250, 0.8);
  border: none;
  border-radius: 50%;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
}

.play-overlay:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

/* Footer Styles */
.carousel-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.indicators {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #60a5fa;
  transform: scale(1.2);
  width: 24px;
  border-radius: 12px;
}

.announcement-description {
  color: #cbd5e1;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .media-container {
    width: 95%; /* Wider on mobile */
    height: 50vh;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .announcement-title {
    font-size: 1.5rem;
  }
}
</style>
