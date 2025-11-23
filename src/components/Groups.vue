<template>
  <div class="user-groups-gamer">
    <!-- Header con perfil (solo para usuarios normales) -->
    <div v-if="!canModerate && currentUser.role_id!==3" class="header-container">
      <div class="header-content">
        <h1 class="page-title">
          <IconUsersGroup :size="32" />
          Grupos
        </h1>
      </div>
      <!-- Profile Button -->
      <div class="profile-section">
        <div class="profile-avatar" @click="showProfileModal = true">
          <img
            v-if="
              currentUser?.photo_url && currentUser?.photo_status === 'approved'
            "
            :src="currentUser.photo_url"
            :alt="currentUser.name"
          />
          <div v-else class="avatar-placeholder">
            <IconUser :size="32" />
          </div>
          <button class="edit-profile-btn">
            <IconEdit :size="16" />
          </button>
        </div>
        <div v-if="currentUser" class="profile-info">
          <p class="profile-name">{{ currentUser.name }}</p>
          <p class="profile-email">{{ currentUser.email }}</p>
        </div>
      </div>
    </div>

    <!-- Header Admin -->
    <div v-else-if="currentUser.role_id!==3" class="header-container my-2">
      <div class="header-content">
        <h1 class="page-title">
          <IconUsersGroup :size="32" />
          Gestión de Grupos
        </h1>
      
      <BButton
        variant="primary"
        class="btn-create-group ms-auto align-self-start"
        @click="openCreateModal"
      >
        <IconPlus :size="20" />
        <span>Crear Grupo</span>
      </BButton>
      </div>
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

      <!-- Mi Grupo -->
      <div v-if="myGroup" class="group-card-gamer my-group-card">
        <div
          v-if="myGroup.group_img_url"
          class="group-cover"
          :class="{ 'cover-hidden': !coverVisible[myGroup.id] }"
          :style="{ backgroundImage: `url(${myGroup.group_img_url})` }"
          @click="handleCoverClick(myGroup)"
        ></div>
        <div class="card-header-gamer">
          <div class="header-content">
            <div class="group-avatar">
              <img
                v-if="myGroup.group_img_url"
                :src="myGroup.group_img_url"
                :alt="myGroup.name"
              />
              <IconFolder v-else :size="24" />
            </div>
            <h3>{{ myGroup.name }}</h3>
          </div>
          <BBadge variant="success" class="my-group-badge"> Mi Grupo </BBadge>
        </div>

        <div class="users-grid">
          <div
            v-for="user in myGroup.users"
            :key="user.id"
            class="user-card-mini"
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
        </div>
      </div>

      <!-- Grupos -->
      <div
        v-for="group in otherGroups"
        :key="group.id"
        class="group-card-gamer"
        @dragover.prevent
        @drop="handleDrop(group.id)"
      >
        <div
          v-if="group.group_img_url"
          class="group-cover"
          :class="{ 'cover-hidden': !coverVisible[group.id] }"
          :style="{ backgroundImage: `url(${group.group_img_url})` }"
          @click="handleCoverClick(group)"
        ></div>

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
              {{ group.users?.length || 0 }}
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
            >
              <IconTrash :size="16" />
            </BButton>
          </div>
        </div>

        <div class="users-grid">
          <div
            v-for="user in group.users"
            :key="user.id"
            class="user-card-mini"
            :draggable="canModerate"
            @dragstart="handleDragStart(user, group.id)"
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
              class="btn-remove-user"
              @click.stop="removeFromGroup(user.id, group.id)"
              v-b-tooltip.hover.top="'Remover del grupo'"
            >
              <IconX :size="14" />
            </button>
          </div>
          <div
            v-if="!group.users || group.users.length === 0"
            class="empty-state"
          >
            <IconMoodEmpty :size="48" />
            <p>Sin miembros</p>
          </div>
        </div>
      </div>

      <!-- Usuarios Baneados -->
      <div class="group-card-gamer banned-card">
        <div class="card-header-gamer">
          <div class="header-content">
            <IconBan :size="24" />
            <h3>Baneados</h3>
          </div>
          <BBadge variant="danger" class="user-count-badge">
            {{ bannedUsers.length }}
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

    <!-- User Detail Modal -->
    <UserDetailModal
      v-if="selectedUser"
      v-model="showUserDetail"
      :user="selectedUser"
      @close="handleCloseModalDetail"
    />

    <!-- Profile Edit Modal -->
    <ProfileEditModal
      v-model="showProfileModal"
      :user="currentUser"
      @updated="handleProfileUpdated"
    />

    <!-- Modal Crear/Editar Grupo -->
  <GroupFormModal v-model="showCreateModal" :initialGroup="editingGroup" @saved="getAllGroups" />

    <!-- Ban User Modal -->
    <BanUserModal
      v-if="userToBan && groupIdToBan"
      v-model="showBanModal"
      :user="userToBan"
      :group-id="groupIdToBan"
      @ban="handleBan"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { groupService } from "@/services/group.service";
import type {
  Group,
  User,
  AllGroupsResponse,
} from "@/interfaces/groups.interface";
import { addPreloader, removePreloader } from "@/composables/usePreloader";
import UserDetailModal from "@/components/UserDetailModal.vue";
import ProfileEditModal from "@/views/user/components/ProfileEditModal.vue";
import GroupFormModal from '@/components/GroupFormModal.vue'
import { groups } from "@/api/backendApi";
import BanUserModal from "@/views/ceo/components/groups/BanUserModal.vue";
import { useAlert } from "@/composables/useAlert";

//Data section
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user as any);
const groupsService = groupService;
const groupsList = ref<Group[]>([]);
const coverVisible = reactive<Record<number, boolean>>({});
const usersWithoutGroup = ref<User[]>([]);
const bannedUsers = ref<User[]>([]);
const showUserDetail = ref(false);
const selectedUser = ref<User | null>(null);
const showProfileModal = ref(false);

// Admin features
const { toast, confirm } = useAlert();
const canModerate = computed(() => authStore.canModerate);
const showCreateModal = ref(false);
const editingGroup = ref<Group | null>(null);
const groupForm = ref({ name: "", group_img_url: "" });
// GroupFormModal is used in the template
const draggedUser = ref<{ user: User; fromGroupId: number | null } | null>(
  null
);

// Ban modal refs
const showBanModal = ref(false);
const userToBan = ref<User | null>(null);
const groupIdToBan = ref<number | null>(null);

//Computed section
const myGroup = computed(() => {
  if (!currentUser.value?.group_id) return null;
  return (
    groupsList.value.find((g) => g.id === currentUser.value?.group_id) ?? null
  );
});
const otherGroups = computed(() => {
  if (!currentUser.value?.group_id) return groupsList.value;
  return groupsList.value.filter((g) => g.id !== currentUser.value?.group_id);
});

//Mounted section
onMounted(() => {
  getAllGroups();
});

//Methods section Global
async function getAllGroups() {
  try {
    addPreloader();
    const response = await groupsService.getAllGroups();
    const data = response as AllGroupsResponse;
    usersWithoutGroup.value = data.users_without_group || [];
    bannedUsers.value = data.users_banned || [];
    groupsList.value = data.groups_with_users.map((group) => ({
      id: group.id,
      name: group.name,
      group_img_url: group.group_img_url || null,
      users: group.users,
    }));
    Object.keys(coverVisible).forEach((k) => delete coverVisible[parseInt(k)]);
    groupsList.value.forEach((g) => {
      if (g && g.id) coverVisible[g.id] = Boolean(g.group_img_url);
    });
  } catch (error) {
    groupsList.value = [];
    usersWithoutGroup.value = [];
    bannedUsers.value = [];
  } finally {
    removePreloader();
  }
}

function handleCoverClick(group: Group) {
  if (!group?.id) return;
  coverVisible[group.id] = false;
}

function openUserDetail(user: User) {
  console.log(user);
  selectedUser.value = user;
  showUserDetail.value = true;
}

function handleCloseModalDetail() {
  showUserDetail.value = false;
  selectedUser.value = null;
}

function handleProfileUpdated() {
  authStore.fetchUser();
}

// Admin functions
function handleDragStart(user: User, fromGroupId: number | null) {
  draggedUser.value = { user, fromGroupId };
}

async function handleDrop(toGroupId: number) {
  if (!draggedUser.value) return;
  if (toGroupId === draggedUser.value.fromGroupId) return;

  const { user } = draggedUser.value;

  try {
    await groups.assignUser(toGroupId, user.id);
    getAllGroups();
    toast("Usuario movido exitosamente", "success");
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
    getAllGroups();
    toast("Usuario baneado exitosamente", "success");
  } catch (error) {
    toast("Error al banear usuario", "error");
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
    getAllGroups();
    toast("Usuario desbaneado exitosamente", "success");
  } catch (error) {
    toast("Error al desbanear usuario", "error");
  }
}

// saveGroup handled by GroupFormModal; parent listens for @saved to refresh list

function editGroup(group: Group) {
  editingGroup.value = group;
  groupForm.value = {
    name: group.name,
    group_img_url: group.group_img_url || "",
  };
  showCreateModal.value = true;
}

function openCreateModal() {
  editingGroup.value = null
  groupForm.value = { name: '', group_img_url: '' }
  showCreateModal.value = true
}

async function deleteGroup(groupId: number) {
  const result = await confirm(
    "Eliminar Grupo?",
    `¿Deseas eliminar el grupo? Antes de eso te recomiendo quitar a los usuarios.`,
    "Sí, Eliminar",
    "Cancelar"
  );
  if (result.isConfirmed) {
    try {
      await groups.destroy(groupId);
      toast("Grupo eliminado exitosamente", "success");
      getAllGroups();
    } catch (error) {
      toast("Error al eliminar grupo", "error");
    }
  }
}

// modal lifecycle is handled by GroupFormModal; parent only toggles showCreateModal
</script>

<style scoped>
.user-groups-gamer {
  padding: 2rem;
  background: #0f0f23;
  min-height: 100vh;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  transition: all 0.3s;
}

.profile-section:hover {
  border-color: #00d9ff;
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.2);
}

.profile-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #00d9ff;
  box-shadow: 0 0 16px rgba(0, 217, 255, 0.4);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.edit-profile-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00d9ff;
  border: 2px solid #1a1a2e;
  color: #0f0f23;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-profile-btn:hover {
  background: #7c3aed;
  transform: scale(1.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0;
}

.profile-email {
  font-size: 0.8125rem;
  color: #a1a1aa;
  margin: 0;
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
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.group-card-gamer:hover {
  transform: translateY(-4px);
  border-color: #00d9ff;
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.2);
}

.my-group-card {
  border-color: rgba(34, 197, 94, 0.3);
}

.my-group-card:hover {
  border-color: #22c55e;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
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

.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
}

.group-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-count-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.my-group-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: #22c55e !important;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  flex: 1;
}

.user-card-mini {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.user-card-mini:hover {
  background: rgba(0, 217, 255, 0.1);
  border-color: #00d9ff;
  transform: translateY(-2px);
}

.user-avatar-mini {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 217, 255, 0.3);
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

.user-card-mini.banned-user {
  opacity: 0.7;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.user-card-mini.banned-user:hover {
  opacity: 1;
  border-color: #ef4444;
}

/* Admin buttons */
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

/* Modal footer */
.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* Admin header */
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

/* Admin icons */
.btn-icon-gamer {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #52525b;
  gap: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.group-cover {
  position: absolute;
  inset: 0;
  z-index: 20;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.group-cover.cover-hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
