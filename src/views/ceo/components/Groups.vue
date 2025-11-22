<template>
  <div class="groups-management-gamer">
    <!-- Header -->
    <div class="header-container">
      <BButton
        variant="primary"
        v-if="canModerate"
        class="btn-create-group"
        @click="showCreateModal = true"
      >
        <IconPlus :size="20" />
        <span>Crear Grupo</span>
      </BButton>
    </div>

    <!-- Groups Grid -->
    <div class="groups-grid">
      <!-- Usuarios sin grupo -->
      <div class="group-card-gamer no-group-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <IconUserOff :size="24" />
            <h3>Sin Grupo</h3>
          </div>
          <BBadge variant="warning" class="user-count-badge">
            {{ usersWithoutGroup.length }}
          </BBadge>
        </div>

        <div class="users-grid">
          <div
            v-for="user in usersWithoutGroup"
            :key="user.id"
            class="user-card-mini"
            :draggable="canModerate"
            @dragstart="handleDragStart(user, null)"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img
                v-if="user.photo_url && user.photo_status === 'approved'"
                :src="user.photo_url"
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
          </div>
          <div v-if="usersWithoutGroup.length === 0" class="empty-state">
            <IconMoodEmpty :size="48" />
            <p>Todos asignados</p>
          </div>
        </div>
      </div>

      <!-- Grupos -->
      <div
        v-for="group in groupsList"
        :key="group.id"
        class="group-card-gamer"
        @dragover.prevent
        @drop="handleDrop(group.id)"
      >
        <div class="card-header-gamer">
          <div class="header-content">
            <div class="group-avatar">
              <img
                v-if="group.group_img_url"
                :src="group.group_img_url"
                :alt="group.name"
              />
              <IconFolder v-else :size="24" />
            </div>
            <h3>{{ group.name }}</h3>
          </div>
          <div class="header-actions">
            <BBadge variant="info" class="user-count-badge">
              {{ getUsersByGroup(group.id).length }}
            </BBadge>
            <BButton
              v-if="canModerate"
              variant="outline-light"
              size="sm"
              class="btn-icon-gamer"
              @click="editGroup(group)"
              v-b-tooltip.hover.top="'Editar grupo'"
            >
              <IconEdit :size="16" />
            </BButton>
            <BButton
              v-if="canModerate"
              variant="outline-danger"
              size="sm"
              class="btn-icon-gamer"
              @click="deleteGroup(group.id)"
              v-b-tooltip.hover.top="'Eliminar grupo'"
              V-
            >
              <IconTrash :size="16" />
            </BButton>
          </div>
        </div>

        <div class="users-grid">
          <div
            v-for="user in getUsersByGroup(group.id)"
            :key="user.id"
            class="user-card-mini"
            :draggable="canModerate"
            @dragstart="handleDragStart(user, group.id)"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img
                v-if="user.photo_url && (user as any).photo_status === 'approved'"
                :src="user.photo_url"
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
            <button
              v-if="canModerate"
              class="btn-remove-user"
              @click.stop="removeFromGroup(user.id, group.id)"
              v-b-tooltip.hover.top="'Remover del grupo'"
            >
              <IconX :size="14" />
            </button>
          </div>
          <div
            v-if="getUsersByGroup(group.id).length === 0"
            class="empty-state"
          >
            <IconDragDrop :size="48" />
            <p>Arrastra usuarios aquí</p>
          </div>
        </div>
      </div>

      <!-- Usuarios Baneados -->
      <div class="group-card-gamer banned-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <IconBan :size="24" />
            <h3>
              Baneados
              {{ bannedUsers ? `(${bannedUsers.length})` : "(loading...)" }}
            </h3>
          </div>
          <BBadge variant="danger" class="user-count-badge">
            {{ bannedUsers?.length || 0 }}
          </BBadge>
        </div>

        <div class="users-grid">
          <div
            v-for="user in bannedUsers"
            :key="user.id"
            class="user-card-mini banned-user"
            @click="openUserDetail(user)"
          >
            <div class="user-avatar-mini">
              <img
                v-if="user.photo_url && user.photo_status === 'approved'"
                :src="user.photo_url"
                :alt="user.name"
              />
              <div v-else class="avatar-placeholder-mini">
                <IconUser :size="20" />
              </div>
            </div>
            <span class="user-name-mini">{{ user.name }}</span>
            <button
              v-if="canModerate"
              class="btn-unban-user"
              @click.stop="handleUnban(user.id)"
              v-b-tooltip.hover.top="'Desbanear usuario'"
            >
              <IconUserCheck :size="14" />
            </button>
          </div>
          <div v-if="bannedUsers.length === 0" class="empty-state">
            <IconMoodEmpty :size="48" />
            <p>No hay usuarios baneados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Grupo -->
    <BModal
      v-model="showCreateModal"
      :title="editingGroup ? 'Editar Grupo' : 'Crear Grupo'"
      centered
      header-bg-variant="dark"
      header-text-variant="light"
      no-footer
    >
      <BFormGroup label="Nombre del Grupo" label-for="group-name">
        <BFormInput
          id="group-name"
          v-model="groupForm.name"
          placeholder="Ej: Equipo Alpha"
        />
      </BFormGroup>

      <div class="modal-footer-custom">
        <BButton variant="primary" @click="saveGroup">
          <IconDeviceFloppy :size="20" />
          {{ editingGroup ? "Actualizar" : "Crear" }}
        </BButton>
      </div>
    </BModal>

    <!-- User Detail Modal -->
    <UserDetailModal v-model="showUserDetail" :user="selectedUser as any" />

    <!-- Ban User Modal -->
    <BanUserModal
      v-model="showBanModal"
      :user="userToBan"
      :group-id="groupIdToBan"
      @ban="handleBan"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { groups } from "@/api/backendApi";
import { useCeoUsersStore } from "@/views/ceo/store/usersStore";
import { useAuthStore } from "@/stores";
import UserDetailModal from "./groups/UserDetailModal.vue";
import BanUserModal from "@/views/ceo/components/groups/BanUserModal.vue";
import { useAlert } from "@/composables/useAlert";

const { toast,confirm } = useAlert();

const authStore = useAuthStore();
const canModerate = computed(() => authStore.canModerate);

interface Group {
  id: number;
  name: string;
  group_img_url: string | null;
  users_count: number;
  users?: User[];
}

interface SocialNetwork {
  id: number;
  name: string;
  logo_url: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  photo_url?: string | null;
  photo_status?: string;
  nickname?: string | null;
  birthdate?: string | null;
  group_id?: number | null;
  account_status?: string;
  created_at?: string;
  social_network?: SocialNetwork | null;
  banned_at?: string | null;
  ban_reason?: string | null;
  banned_by?: number | null;
}

const usersStore = useCeoUsersStore();
const groupsList = ref<Group[]>([]);
const usersWithoutGroup = ref<User[]>([]);
const bannedUsers = ref<User[]>([]);
const showCreateModal = ref(false);
const editingGroup = ref<Group | null>(null);
const groupForm = ref({ name: "", group_img_url: "" });
const draggedUser = ref<{ user: User; fromGroupId: number | null } | null>(
  null
);
const showUserDetail = ref(false);
const selectedUser = ref<User | null>(null);

// Ban modal refs
const showBanModal = ref(false);
const userToBan = ref<User | null>(null);
const groupIdToBan = ref<number | null>(null);

onMounted(() => {
  loadGroups();
  loadUsersWithoutGroup();
  loadBannedUsers();
  usersStore.fetchAll();
});

const getUsersByGroup = computed(() => {
  return (groupId: number) => {
    return usersStore.users.filter((u: any) => u.group_id === groupId);
  };
});

async function loadGroups() {
  try {
    const response = await groups.all();
    groupsList.value = response.data;
  } catch (error) {
    console.error("Error al cargar grupos:", error);
  }
}

async function loadUsersWithoutGroup() {
  try {
    const response = await groups.usersWithoutGroup();
    usersWithoutGroup.value = response.data;
  } catch (error) {
    console.error("Error al cargar usuarios sin grupo:", error);
  }
}

async function saveGroup() {
  try {
    if (editingGroup.value) {
      await groups.update(editingGroup.value.id, groupForm.value);
      toast("Grupo actualizado","success");
    } else {
      await groups.create(groupForm.value);
      toast("Grupo creado","success");
    }
    closeModal();
    loadGroups();
  } catch (error: any) {
    toast("Error al guardar grupo","error");
  }
}

function editGroup(group: Group) {
  editingGroup.value = group;
  groupForm.value = {
    name: group.name,
    group_img_url: group.group_img_url || "",
  };
  showCreateModal.value = true;
}

async function deleteGroup(groupId: number) {
  const result = await confirm(
    "Eliminar Grupo?",
    `¿Deseas Eliminar El grupo ? antes de eso te recomiendo quitar a los usuarios?`,
    "Sí, Eliminar",
    "Cancelar"
  );
  if (result.isConfirmed) {
    try {
      await groups.destroy(groupId);
      toast('Grupo Eliminado Exitosamente', 'success')
      loadGroups();
      loadUsersWithoutGroup();
      usersStore.fetchAll();
    } catch (error) {
      toast("Error al eliminar grupo","error");
    }
  }
}

function closeModal() {
  showCreateModal.value = false;
  editingGroup.value = null;
  groupForm.value = { name: "", group_img_url: "" };
}

function handleDragStart(user: User, fromGroupId: number | null) {
  draggedUser.value = { user, fromGroupId };
}

async function handleDrop(toGroupId: number) {
  if (!draggedUser.value) return;

  const { user } = draggedUser.value;

  try {
    // Asignar al nuevo grupo (esto automáticamente remueve del grupo anterior sin banear)
    await groups.assignUser(toGroupId, user.id);

    // Recargar datos
    loadGroups();
    loadUsersWithoutGroup();
    usersStore.fetchAll();

    draggedUser.value = null;
  } catch (error) {
    toast("Error al mover usuario", "error");
  }
}

function removeFromGroup(userId: number, groupId: number) {
  const user = groupsList.value
    .find((g) => g.id === groupId)
    ?.users?.find((u) => u.id === userId);

  if (!user) return;

  userToBan.value = user;
  groupIdToBan.value = groupId;
  showBanModal.value = true;
}

async function handleBan({
  userId,
  groupId,
  banReason,
}: {
  userId: number;
  groupId: number;
  banReason: string;
}) {
  try {
    await groups.removeUser(groupId, userId, banReason);
    showBanModal.value = false;
    userToBan.value = null;
    groupIdToBan.value = null;
    loadGroups();
    loadUsersWithoutGroup();
    loadBannedUsers();
    usersStore.fetchAll();
  } catch (error) {
    toast("Error al banear usuario", "error");
  }
}

async function loadBannedUsers() {
  try {
    const response = await groups.bannedUsers();
    bannedUsers.value = response.data || [];
  } catch (error) {
    bannedUsers.value = [];
  }
}

async function handleUnban(userId: number) {
  const result = await confirm(
    "Desbanear Usuario?",
    `¿Estás seguro de desbanear este usuario?`,
    "Sí, Desbanear",
    "Cancelar"
  );
  if (!result.isConfirmed) return;
  try {
    await groups.unbanUser(userId);
    loadBannedUsers();
    loadUsersWithoutGroup();
    usersStore.fetchAll();
    toast('Usuario desbaneado exitosamente', 'success')
  } catch (error) {
    toast("Error al desbanear usuario", "error");
  }
}

function openUserDetail(user: User) {
  selectedUser.value = user;
  showUserDetail.value = true;
}
</script>

<style scoped>
.groups-management-gamer {
  padding: 2rem;
  background: #0f0f23;
  min-height: 100vh;
}

/* Header */
.header-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.gamer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  color: #00d9ff;
  filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.5));
}

.header-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-create-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-create-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.3);
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.group-card-gamer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.group-card-gamer:hover {
  transform: translateY(-4px);
  border-color: #00d9ff;
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.2);
}

.no-group-card {
  border-color: rgba(251, 191, 36, 0.3);
}

.no-group-card:hover {
  border-color: #fbbf24;
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.2);
}

.banned-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.banned-card:hover {
  border-color: #ef4444;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
}

/* Card Header */
.card-header-gamer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e4e4e7;
}

.header-content h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 217, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d9ff;
  overflow: hidden;
}

.group-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-count-badge {
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
}

.btn-icon-gamer {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  flex: 1;
}

.user-card-mini {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.user-card-mini:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00d9ff;
  transform: translateY(-2px);
}

.user-avatar-mini {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #00d9ff;
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-mini {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.user-name-mini {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e4e4e7;
  text-align: center;
  word-break: break-word;
}

.btn-remove-user {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  border: none;
  color: white;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card-mini:hover .btn-remove-user {
  display: flex;
}

.btn-remove-user:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.btn-unban-user {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  border: none;
  color: white;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card-mini.banned-user:hover .btn-unban-user {
  display: flex;
}

.btn-unban-user:hover {
  background: #059669;
  transform: scale(1.1);
}

.user-card-mini.banned-user {
  opacity: 0.7;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.user-card-mini.banned-user:hover {
  opacity: 1;
  border-color: #ef4444;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #71717a;
  gap: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
}

/* Modal Footer */
.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .header-container {
    justify-content: center;
  }

  .gamer-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-left {
    width: 100%;
  }

  .btn-create-group {
    width: 100%;
    justify-content: center;
  }
}
</style>
