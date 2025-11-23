<template>
  <div class="users-management-gamer">
    <BCard no-body class="gamer-card">
      <BCardBody class="gamer-card-body">
        <!-- Tabs Modernos -->
        <div class="mb-4">
          <ModernTabs
            :tabs="tabs"
            :selected-tab="selectedTab"
            :stats="stats"
            @update:selected-tab="selectedTab = $event"
          />
        </div>

        <!-- Search -->
        <BRow class="mb-3">
          <BCol md="6" class="ms-auto">
            <BInputGroup>
              <BFormInput v-model="searchQuery" placeholder="Buscar por nombre o email..." />
              <BInputGroupText>
                <IconSearch :size="18" style="cursor: pointer;" @click="fetchUsers" />
              </BInputGroupText>
            </BInputGroup>
          </BCol>
        </BRow>

        <!-- Table -->
        <BTable :items="users" :fields="userTableFields" :busy="isBusy" hover responsive striped>
          <template #table-busy>
            <div class="text-center my-2">
              <BSpinner class="align-middle"></BSpinner>
              <strong class="ms-2">Cargando...</strong>
            </div>
          </template>

          <template #cell(name)="data">
            <div class="d-flex align-items-center">
              <ImagePreview :src="data.item.photo_url || undefined" :alt="data.item.name"
                :initial="data.item.name.charAt(0).toUpperCase()" :size="40" class="me-2" />
              <div>
                <div class="fw-bold">{{ data.item.name }}</div>
                <small class="text-muted">{{ data.item.email }}</small>
              </div>
            </div>
          </template>

          <template #cell(birthdate)="data">
            {{ formatDate(data.item.birthdate) }}
          </template>

          <template #cell(social_network)="data">
            <div v-if="data.item.social_network" class="d-flex align-items-center justify-content-center gap-2">
              <img :src="data.item.social_network.logo_url" :alt="data.item.social_network.name"
                class="social-network-icon" v-b-tooltip.hover :title="data.item.social_network.name" />
              <span class="social-nickname">{{ data.item.nickname }}</span>
            </div>
            <span v-else class="text-muted small">-</span>
          </template>

          <template #cell(photo_status)="data">
            <div class="d-flex align-items-center justify-content-center gap-1">
              <component :is="getPhotoStatusIcon(data.item.photo_status)" :size="18"
                :class="'text-' + getPhotoStatusVariant(data.item.photo_status)" v-b-tooltip.hover
                :title="getPhotoStatusText(data.item.photo_status)" />
            </div>
          </template>

          <template #cell(account_status)="data">
            <div class="d-flex align-items-center justify-content-center gap-1">
              <component :is="getAccountStatusIcon(data.item.account_status)" :size="18"
                :class="'text-' + getAccountStatusVariant(data.item.account_status)" v-b-tooltip.hover
                :title="getAccountStatusText(data.item.account_status)" />
            </div>
          </template>

          <template #cell(created_at)="data">
            {{ formatDate(data.item.created_at) }}
          </template>

          <template #cell(actions)="data">
            <!-- Acciones para tab 1: Usuarios Activos -->
            <template v-if="selectedTab === 'activeUsers'">
              <div class="d-flex gap-2 justify-content-center">
                <BButton variant="outline-primary" size="sm" @click="editUser(data.item)" v-b-tooltip.hover
                  title="Editar usuario" class="icon-btn">
                  <IconEdit :size="16" />
                </BButton>
                <BButton variant="outline-danger" size="sm" @click="deleteUser(data.item)" v-b-tooltip.hover
                  title="Eliminar usuario" class="icon-btn">
                  <IconTrash :size="16" />
                </BButton>
              </div>
            </template>

            <!-- Acciones para tab 2: Fotos Pendientes -->
            <template v-if="selectedTab === 'pendingPhotos'">
              <div class="d-flex gap-2 justify-content-center">
                <BButton v-if="
                  data.item.photo_status === 'pending' ||
                  data.item.photo_status === 'rejected'
                " variant="outline-success" size="sm" @click="approvePhoto(data.item)" v-b-tooltip.hover
                  title="Aprobar foto" class="icon-btn">
                  <IconCircleCheck :size="16" />
                </BButton>
                <BButton v-if="data.item.photo_status === 'pending'" variant="outline-danger" size="sm"
                  @click="rejectPhoto(data.item)" v-b-tooltip.hover title="Rechazar foto" class="icon-btn">
                  <IconCircleX :size="16" />
                </BButton>
              </div>
            </template>

            <!-- Acciones para tab 3: Usuarios Rechazados -->
            <template v-if="selectedTab === 'rejectedUsers'">
              <div class="d-flex gap-2 justify-content-center">
                <BButton variant="outline-success" size="sm" @click="approveUser(data.item)" v-b-tooltip.hover
                  title="Aprobar usuario" class="icon-btn">
                  <IconCircleCheck :size="16" />
                </BButton>
                <BButton variant="outline-danger" size="sm" @click="deleteUser(data.item)" v-b-tooltip.hover
                  title="Eliminar usuario" class="icon-btn">
                  <IconTrash :size="16" />
                </BButton>
              </div>
            </template>

            <!-- Acciones para tab 4: Pendientes de Aprobación -->
            <template v-if="selectedTab === 'pendingApproval'">
              <!-- Si NO tiene foto, solo mostrar Aprobar y Rechazar -->
              <template v-if="!data.item.photo_url">
                <div class="d-flex gap-2 justify-content-center">
                  <BButton variant="outline-success" size="sm" @click="approveUserWithoutPhoto(data.item)"
                    v-b-tooltip.hover title="Aprobar usuario" class="icon-btn">
                    <IconCircleCheck :size="16" />
                  </BButton>
                  <BButton variant="outline-danger" size="sm" @click="rejectUser(data.item)" v-b-tooltip.hover
                    title="Rechazar usuario" class="icon-btn">
                    <IconUserX :size="16" />
                  </BButton>
                </div>
              </template>

              <!-- Si tiene foto, mostrar todas las opciones -->
              <template v-else>
                <div class="d-flex gap-2 justify-content-center">
                  <BButton variant="outline-success" size="sm" @click="approveUserWithPhoto(data.item)"
                    v-b-tooltip.hover title="Aprobar con foto" class="icon-btn">
                    <IconCircleCheck :size="16" />
                  </BButton>
                  <BButton variant="outline-warning" size="sm" @click="approveUserWithoutPhoto(data.item)"
                    v-b-tooltip.hover title="Aprobar sin foto" class="icon-btn">
                    <IconUserCheck :size="16" />
                  </BButton>
                  <BButton variant="outline-danger" size="sm" @click="rejectUser(data.item)" v-b-tooltip.hover
                    title="Rechazar usuario" class="icon-btn">
                    <IconUserX :size="16" />
                  </BButton>
                </div>
              </template>
            </template>
          </template>
        </BTable>

        <!-- Empty State -->
        <div v-if="!isBusy && users.length === 0" class="text-center py-5 empty-state-users">
          <IconInbox :size="64" class="empty-icon" />
          <p class="empty-text mt-3">No hay usuarios para mostrar</p>
        </div>

        <!-- Paginación -->
        <div v-if="totalRows > perPage" class="d-flex justify-content-between align-items-center mt-4">
          <div class="pagination-info">
            Mostrando {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, totalRows) }} de {{
              totalRows
            }} usuarios
          </div>
          <BPagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"
            @update:modelValue="handlePageChange" align="end" size="sm" class="mb-0" />
        </div>
      </BCardBody>
    </BCard>

    <!-- Modals -->
    <EditUserModal v-model="showEditModal" :user="selectedUser" @refresh="handleRefresh" />

    <RejectPhotoModal v-model="showRejectPhotoModal" :user="selectedUser" @refresh="handleRefresh" />

    <RejectAccountModal v-model="showRejectAccountModal" :user="selectedUser" @refresh="handleRefresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { userTableFields } from "@/views/assistant/data/table.fields";
import { assistantUserService } from "@/views/assistant/services/userService";
import EditUserModal from "@/views/assistant/components/users/EditUserModal.vue";
import RejectPhotoModal from "@/views/assistant/components/users/RejectPhotoModal.vue";
import RejectAccountModal from "@/views/assistant/components/users/RejectAccountModal.vue";
import ModernTabs from '@/components/ModernTabs.vue';
import type { User } from "@/interfaces";
import ImagePreview from '@/components/ImagePreview.vue';
import { useAlert } from '@/composables/useAlert';
import { addPreloader, removePreloader } from '@/composables/usePreloader';

const { toast, confirmDelete, confirm } = useAlert();

const selectedTab = ref<string>("activeUsers");
const isBusy = ref(false);
const users = ref<User[]>([]);
const searchQuery = ref("");
const showEditModal = ref(false);
const showRejectPhotoModal = ref(false);
const showRejectAccountModal = ref(false);
const selectedUser = ref<User | null>(null);

// Paginación
const currentPage = ref(1);
const perPage = ref(10);
const totalRows = ref(0);
const lastPage = ref(1);

const tabs = [
  {
    key: "activeUsers" as const,
    label: "Usuarios Activos",
    value: 1,
    icon: "IconUsers",
  },
  {
    key: "pendingPhotos" as const,
    label: "Fotos Pendientes",
    value: 2,
    icon: "IconPhoto",
  },
  {
    key: "rejectedUsers" as const,
    label: "Usuarios Rechazados",
    value: 3,
    icon: "IconUserX",
  },
  {
    key: "pendingApproval" as const,
    label: "Pendientes de Aprobacion",
    value: 4,
    icon: "IconUserCheck",
  },
];
const stats = ref({
  activeUsers: 0,
  pendingPhotos: 0,
  rejectedUsers: 0,
  pendingApproval: 0,
});

const fetchUsers = async () => {
  if (isBusy.value) return;
  isBusy.value = true;
  try {
    // Mapear key a número para la API
    const tabNumber = tabs.find(t => t.key === selectedTab.value)?.value || 1;
    const response = await assistantUserService.getUsersByTab({
      tab: tabNumber,
      search: searchQuery.value,
      per_page: perPage.value,
      page: currentPage.value
    });

    users.value = response.data || [];
    totalRows.value = response.total || 0;
    currentPage.value = response.current_page || 1;
    lastPage.value = response.last_page || 1;

    return users.value;
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    users.value = [];
    totalRows.value = 0;
  } finally {
    isBusy.value = false;
  }
};

const handlePageChange = (page: number | string) => {
  currentPage.value = typeof page === 'string' ? parseInt(page) : page;
  fetchUsers();
};

const updateStats = async () => {
  try {
    const counters = await assistantUserService.getCounters();
    stats.value = counters;
  } catch (error) {
    console.error("Error al actualizar estadísticas:", error);
  }
};

const deleteUser = async (user: User) => {
  const result = await confirmDelete(user.name)
  if (result.isConfirmed) {
    try {
      await assistantUserService.deleteUser(user.id)
      await fetchUsers()
      await updateStats()
      toast('Usuario eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast('Error al eliminar usuario', 'error')
    }
  }
}

const approvePhoto = async (user: User) => {
  const result = await confirm(
    '¿Aprobar foto?',
    `¿Deseas aprobar la foto de ${user.name}?`,
    'Sí, aprobar',
    'Cancelar'
  )
  if (result.isConfirmed) {
    try {
      await assistantUserService.approvePhoto(user.id)
      await fetchUsers()
      await updateStats()
      toast('Foto aprobada exitosamente', 'success')
    } catch (error) {
      console.error('Error al aprobar foto:', error)
      toast('Error al aprobar foto', 'error')
    }
  }
}

const approveUser = async (user: User) => {
  const result = await confirm(
    '¿Aprobar cuenta?',
    `¿Deseas aprobar la cuenta de ${user.name}?`,
    'Sí, aprobar',
    'Cancelar'
  )
  if (result.isConfirmed) {
    try {
      await assistantUserService.approveUser(user.id)
      await fetchUsers()
      await updateStats()
      toast('Usuario aprobado exitosamente', 'success')
    } catch (error) {
      console.error('Error al aprobar usuario:', error)
      toast('Error al aprobar usuario', 'error')
    }
  }
}

const approveUserWithPhoto = async (user: User) => {
  const result = await confirm(
    '¿Aprobar con foto?',
    `¿Deseas aprobar a ${user.name} con foto de perfil?`,
    'Sí, aprobar',
    'Cancelar'
  )
  if (result.isConfirmed) {
    try {
      await assistantUserService.approveUserWithPhoto(user.id)
      await fetchUsers()
      await updateStats()
      toast('Usuario aprobado con foto exitosamente', 'success')
    } catch (error) {
      console.error('Error al aprobar usuario:', error)
      toast('Error al aprobar usuario', 'error')
    }
  }
}

const approveUserWithoutPhoto = async (user: User) => {
  const result = await confirm(
    '¿Aprobar sin foto?',
    `¿Deseas aprobar a ${user.name} sin foto de perfil?`,
    'Sí, aprobar',
    'Cancelar'
  )
  if (result.isConfirmed) {
    try {
      await assistantUserService.approveUserWithoutPhoto(user.id)
      await fetchUsers()
      await updateStats()
      toast('Usuario aprobado sin foto exitosamente', 'success')
    } catch (error) {
      console.error('Error al aprobar usuario:', error)
      toast('Error al aprobar usuario', 'error')
    }
  }
}

const handleRefresh = async () => {
  searchQuery.value = "";
  await fetchUsers();
  await updateStats();
};

const getPhotoStatusVariant = (status: string | null) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
};

const getPhotoStatusIcon = (status: string | null) => {
  switch (status) {
    case "approved":
      return "IconCircleCheck";
    case "pending":
      return "IconClock";
    case "rejected":
      return "IconCircleX";
    default:
      return "IconPhotoOff";
  }
};

const getPhotoStatusText = (status: string | null) => {
  switch (status) {
    case "approved":
      return "Foto Aprobada";
    case "pending":
      return "Foto Pendiente";
    case "rejected":
      return "Foto Rechazada";
    default:
      return "Sin foto";
  }
};

const getAccountStatusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
};

const getAccountStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return "IconUserCheck";
    case "pending":
      return "IconClock";
    case "rejected":
      return "IconUserX";
    default:
      return "IconUser";
  }
};

const getAccountStatusText = (status: string) => {
  switch (status) {
    case "approved":
      return "Cuenta Aprobada";
    case "pending":
      return "Cuenta Pendiente";
    case "rejected":
      return "Cuenta Rechazada";
    default:
      return "Desconocido";
  }
};

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const editUser = (user: User) => {
  selectedUser.value = user;
  showEditModal.value = true;
};

const rejectPhoto = (user: User) => {
  selectedUser.value = user;
  showRejectPhotoModal.value = true;
};

const rejectUser = (user: User) => {
  selectedUser.value = user;
  showRejectAccountModal.value = true;
};

onMounted(async () => {
  addPreloader();
  try {
    await fetchUsers();
    await updateStats();
  } catch (error) {
    console.error('Error en onMounted:', error);
  } finally {
    removePreloader();
  }
});

watch(selectedTab, (oldValue, newValue) => {
  if (oldValue !== newValue) {
    searchQuery.value = "";
    currentPage.value = 1;
    fetchUsers();
  }
});
</script>

<style scoped>
/* Contenedor principal */
.users-management-gamer {
  padding: 2rem;
  background: #0f0f23;
  min-height: 100vh;
}

.gamer-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.gamer-card-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid rgba(0, 217, 255, 0.3);
  padding: 1.5rem;
}

.gamer-title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.gamer-card-body {
  background: #0f0f23;
  padding: 1.5rem;
}

/* Tabs modernos */
.modern-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #a1a1aa;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.tab-item:hover {
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
}

.tab-item.active {
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

.tab-label {
  font-size: 0.9rem;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.tab-item.active .tab-badge {
  background: white;
  color: #7c3aed;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.table) {
  margin-bottom: 0;
  color: #e4e4e7;
}

:deep(.table th) {
  background: rgba(26, 26, 46, 0.5);
  font-weight: 600;
  color: #00d9ff;
  border-bottom: 2px solid rgba(0, 217, 255, 0.3);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  vertical-align: middle;
}

:deep(.table td) {
  vertical-align: middle;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  background-color: rgba(26, 26, 46, 0.3);
}

:deep(.table tbody tr) {
  background-color: rgba(26, 26, 46, 0.3);
  transition: background-color 0.2s ease;
}

/* Alineación específica para centrado */
:deep(.table th.text-center),
:deep(.table td.text-center) {
  text-align: center !important;
}

:deep(.table th.text-start),
:deep(.table td.text-start) {
  text-align: left !important;
}

:deep(.table-hover tbody tr:hover) {
  background-color: rgba(0, 217, 255, 0.1);
}

:deep(.table-hover tbody tr:hover td) {
  background-color: rgba(0, 217, 255, 0.1);
}

/* Empty state - No hay usuarios */
:deep(.table tbody tr td) {
  color: #e4e4e7;
}

:deep(.table tbody tr td[colspan]) {
  background-color: rgba(26, 26, 46, 0.5);
  color: #a1a1aa;
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.125rem;
  font-weight: 500;
}

.empty-state-users {
  background: rgba(26, 26, 46, 0.3);
  border-radius: 12px;
  padding: 3rem 2rem;
  margin: 2rem 0;
}

.empty-icon {
  color: #71717a;
  opacity: 0.6;
}

.empty-text {
  color: #a1a1aa;
  font-size: 1.125rem;
  font-weight: 500;
  margin-top: 1rem;
}

/* Paginación info */
.pagination-info {
  color: #a1a1aa;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Textos en tabla */
:deep(.table .text-muted) {
  color: #a1a1aa !important;
}

:deep(.table .fw-bold) {
  color: #e4e4e7;
  font-weight: 600;
}

:deep(.table small) {
  color: #a1a1aa;
  font-size: 0.875rem;
}

:deep(.table .social-nickname) {
  color: #e4e4e7;
}

/* Asegurar que todos los textos en celdas sean visibles */
:deep(.table td > div) {
  color: #e4e4e7;
}

:deep(.table td > span:not(.badge)) {
  color: #e4e4e7;
}

/* Texto cuando no hay valor (guión) */
:deep(.table .text-muted.small) {
  color: #71717a !important;
  font-size: 1rem;
}

/* Card styling */
:deep(.card) {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

:deep(.card-header) {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1.25rem 1.5rem;
  border-radius: 12px 12px 0 0 !important;
}

:deep(.card-body) {
  padding: 1.5rem;
}

/* Paginación */
:deep(.pagination) {
  gap: 0.25rem;
}

:deep(.page-item .page-link) {
  border-radius: 6px;
  border: 1px solid rgba(0, 217, 255, 0.3);
  background: rgba(26, 26, 46, 0.5);
  color: #e4e4e7;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  transition: all 0.2s ease;
}

:deep(.page-item.active .page-link) {
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  border-color: #00d9ff;
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
  color: white;
}

:deep(.page-item .page-link:hover) {
  background-color: rgba(0, 217, 255, 0.1);
  border-color: #00d9ff;
  transform: translateY(-1px);
  color: #00d9ff;
}

:deep(.page-item.disabled .page-link) {
  opacity: 0.5;
}

/* Inputs y formularios */
:deep(.form-control) {
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border-radius: 8px;
}

:deep(.form-control:focus) {
  background: rgba(26, 26, 46, 0.7);
  border-color: #00d9ff;
  box-shadow: 0 0 0 0.2rem rgba(0, 217, 255, 0.25);
  color: #e4e4e7;
}

:deep(.form-control::placeholder) {
  color: #71717a;
}

:deep(.input-group-text) {
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #00d9ff;
}

/* Social Network */
.social-network-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.social-network-icon:hover {
  transform: scale(1.1);
}

.social-nickname {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}
</style>