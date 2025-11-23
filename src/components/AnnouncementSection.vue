<template>
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

          <!-- small controls over the media -->
          <div class="media-controls">
            <button type="button" @click="prev" class="control-btn" aria-label="Anterior">
              <IconChevronLeft :size="14"/>
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
              <IconChevronRight :size="14"/>
            </button>
          </div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, toRef, Ref } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement';

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
  await announcementStore.fetchAnnouncements();
  if (announcements.value.length > 0) currentIndex.value = 0;
  startAuto();
});

onBeforeUnmount(() => {
  clearAuto();
});
</script>

<style scoped>
.announcement-section {
  padding: 0.5rem 0.5rem 0.6rem 0.5rem;
  margin: 0 .6rem 0.9rem .6rem;
  border-radius: 10px;
  background: transparent;
}
.announcement-loading, .announcement-empty {
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.75rem 0;
  text-align: center;
}
.carousel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.media-wrapper {
  width: 100%;
  height: 110px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.45);
}
.announcement-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.content-wrapper {
  color: #ffffff;
}
.content-wrapper.below {
  text-align: center;
  padding: 6px 6px 10px 6px;
}
.announcement-title {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  font-weight: 700;
  margin: 8px 6px 4px 6px;
  font-size: 2rem;
  line-height: 1.12;
  letter-spacing: 0.2px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.announcement-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: rgba(148,163,184,0.95);
  font-size: 0.78rem;
  align-items: center;
}
.announcement-dates.column { 
  padding-top: 4px;
}
.date-item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.date-line {
  color: rgba(148,163,184,0.95);
  font-size: 0.82rem;
  font-weight: 500;
}
.announcement-description {
  color: rgba(148,163,184,0.95);
  margin: 6px 6px 0 6px;
  font-size: 1.2rem;
  max-height: 56px;
  overflow: hidden;
  line-height: 1.25;
  font-weight: 500;
}
.media-controls {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.play-overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.92);
  border-radius: 999px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(2,6,23,0.45);
  cursor: pointer;
  border: none;
}
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.control-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(2,6,23,0.9);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}
.indicators {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.dot {
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.22);
  border-radius: 999px;
  border: none;
  padding: 0;
  opacity: 0.9;
}
.dot.active {
  background: #60a5fa;
  box-shadow: 0 2px 6px rgba(96,165,250,0.25);
}

@media (max-width: 900px) {
  .media-wrapper { height: 84px; }
  .announcement-title { font-size: 2rem }
  .announcement-description { font-size: 1rem }
}
</style>
