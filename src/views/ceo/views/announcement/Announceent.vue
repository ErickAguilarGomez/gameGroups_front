<template>
  <div class="gamer-management-view">
    <BCard no-body class="gamer-card">
      <BCardBody class="gamer-card-body">
        <ModernTabs
          :tabs="tabs"
          :selected-tab="selectedTab"
          :show-icons="true"
          :show-numbers="true"
          @update:selected-tab="selectedTab = $event"
          @tab-change="handleTabChange"
        />

        <!-- Contenido del tab seleccionado -->
        <div v-if="selectedTab === 'announcement'" class="mt-4">
          <StoreAnnouncement />
        </div>

        <div v-else class="mt-4">
          <!-- Table -->
          <BTable
            :items="announcements"
            :fields="filteredTableFields"
            :busy="isBusy"
            hover
            responsive
            striped
            class="mb-0"
          >
            <template #table-busy>
              <div class="text-center my-2">
                <BSpinner class="align-middle"></BSpinner>
                <strong class="ms-2">Cargando...</strong>
              </div>
            </template>

            <!-- Title Column with Image -->
            <template #cell(title)="data">
              <div class="d-flex align-items-center gap-3">
                <div class="announcement-preview">
                  <ImagePreview
                    v-if="!data.item.is_video"
                    :src="data.item.url"
                    :alt="data.item.title"
                    :size="40"
                  />
                  <div
                    v-else
                    class="video-preview"
                    @click="openVideo(data.item.url)"
                  >
                    <IconVideo :size="24" class="text-white" />
                  </div>
                </div>
                <span class="fw-bold text-white">{{ data.item.title }}</span>
              </div>
            </template>

            <!-- Description -->
            <template #cell(description)="data">
              <div
                class="text-truncate"
                style="max-width: 200px"
                :title="data.item.description"
              >
                {{ data.item.description }}
              </div>
            </template>

            <!-- Dates -->
            <template #cell(start_date)="data">
              {{ formatDate(data.item.start_date) }}
            </template>

            <template #cell(end_date)="data">
              {{ formatDate(data.item.end_date) }}
            </template>

            <template #cell(created_at)="data">
              {{ formatDate(data.item.created_at) }}
            </template>

            <!-- Deleted At (only for inactive) -->
            <template #cell(deleted_at)="data">
              {{
                data.item.deleted_at ? formatDate(data.item.deleted_at) : "N/A"
              }}
            </template>

            <!-- Actions -->
            <template #cell(actions)="data">
              <div class="d-flex gap-2 justify-content-center">
                <BButton
                  variant="outline-primary"
                  size="sm"
                  class="icon-btn"
                  v-b-tooltip.hover
                  title="Editar anuncio"
                  @click="openEditModal(data.item)"
                >
                  <IconEdit :size="18" />
                </BButton>
                <BButton
                  variant="outline-danger"
                  size="sm"
                  class="icon-btn"
                  v-b-tooltip.hover
                  title="Eliminar anuncio"
                  @click="deleteAnnouncement(data.item)"
                >
                  <IconTrash :size="18" />
                </BButton>
              </div>
            </template>
          </BTable>

          <!-- Empty State -->
          <div
            v-if="!isBusy && announcements.length === 0"
            class="text-center py-5 empty-state-container"
          >
            <IconInbox :size="64" class="empty-icon" />
            <p class="empty-text mt-3">No hay anuncios para mostrar</p>
          </div>

          <!-- Paginación -->
          <div
            v-if="totalRows > perPage"
            class="d-flex justify-content-between align-items-center mt-4"
          >
            <div class="pagination-info">
              Mostrando {{ (currentPage - 1) * perPage + 1 }} -
              {{ Math.min(currentPage * perPage, totalRows) }} de
              {{ totalRows }} anuncios
            </div>
            <BPagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              @update:modelValue="handlePageChange"
              align="end"
              size="sm"
              class="mb-0"
            />
          </div>
        </div>
      </BCardBody>
    </BCard>

    <!-- Edit Modal -->
    <BModal
      v-model="showEditModal"
      title="Editar Anuncio"
      size="lg"
      no-footer
      scrollable
      hide-footer
      centered
      body-class="p-0"
      header-class="border-bottom-0"
      @close="handleCloseModal"
    >
      <StoreAnnouncement
        v-if="selectedAnnouncement"
        :id="selectedAnnouncement.id"
        @refresh="handleEditSuccess"
      />
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from "vue";
import ModernTabs from "@/components/ModernTabs.vue";
import { announcementService } from "@/views/ceo/services/announcement";
import { addPreloader, removePreloader } from "@/composables";
import StoreAnnouncement from "./components/StoreAnnouncement.vue";
import { announcementTableFields } from "@/views/ceo/data/table.fields";
import ImagePreview from "@/components/ImagePreview.vue";
import { useAlert } from "@/composables/useAlert";

//DATA
const { confirm, toast } = useAlert();
const selectedTab = ref<string>("announcement");
const announcements = ref<any[]>([]);
const isBusy = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const totalRows = ref(0);

// Modals state
const showEditModal = ref(false);
const selectedAnnouncement = ref<any>(null);

const tabs = [
  {
    key: "announcement",
    label: "Crear",
    icon: "IconPlus",
  },
  {
    key: "active",
    label: "Activos",
    icon: "IconSpeakerphone",
  },
  {
    key: "next",
    label: "Proximos",
    icon: "IconCalendarEvent",
  },
  {
    key: "inactive",
    label: "Inactivos",
    icon: "IconArchive",
  },
];

//COMPUTED
const filteredTableFields = computed(() => {
  if (selectedTab.value === "inactive") {
    return announcementTableFields
      .filter((f) => f.key !== "actions")
      .map((f) => (f.key === "deleted_at" ? { ...f, visible: true } : f))
      .filter((f) => f.visible !== false);
  }
  return announcementTableFields.filter((f) => f.key !== "deleted_at");
});

//MOUNTED

onMounted(() => {
  // Only fetch if not on create tab
  if (selectedTab.value !== "announcement") {
    getAnnouncements();
  }
});

//METHODS
const getAnnouncements = async () => {
  if (selectedTab.value === "announcement") return;

  try {
    isBusy.value = true;
    addPreloader();
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      status: selectedTab.value,
    };
    const response = await announcementService.getAnnouncements(params);

    if (response.data) {
      announcements.value = response.data;
      totalRows.value = response.total || 0;
      currentPage.value = response.current_page || 1;
    } else {
      announcements.value = [];
    }
  } catch (error) {
    console.error("Error al obtener los anuncios:", error);
    announcements.value = [];
  } finally {
    removePreloader();
    isBusy.value = false;
  }
};

const formatDate = (date: any) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleTabChange = (tab: any) => {
  selectedTab.value = tab.key;
  if (tab.key !== "announcement") {
    currentPage.value = 1;
    getAnnouncements();
  }
};

const handlePageChange = (page: number | string) => {
  currentPage.value = typeof page === "string" ? parseInt(page) : page;
  getAnnouncements();
};

const openVideo = (url: string) => {
  window.open(url, "_blank");
};

const openEditModal = async (item: any) => {
  selectedAnnouncement.value = item;
  await nextTick();
  showEditModal.value = true;
};

const handleCloseModal = () => {
  showEditModal.value = false;
  selectedAnnouncement.value = null;
};

const handleEditSuccess = () => {
  showEditModal.value = false;
  selectedAnnouncement.value = null;
  getAnnouncements();
};

const deleteAnnouncement = async (item: any) => {
  const result = await confirm(
    "¿Eliminar anuncio?",
    `¿Estás seguro de que deseas eliminar el anuncio "${item.title}"?`,
    "Sí, eliminar",
    "Cancelar"
  );

  if (result.isConfirmed) {
    try {
      addPreloader();
      await announcementService.deleteAnnouncement({ id: item.id });
      toast("Anuncio eliminado exitosamente", "success");
      getAnnouncements();
    } catch (error) {
      console.error("Error al eliminar anuncio:", error);
      toast("Error al eliminar el anuncio", "error");
    } finally {
      removePreloader();
    }
  }
};
</script>
