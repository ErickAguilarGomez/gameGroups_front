<template>
  <BModal
    v-model="isVisible"
    title="Detalle del Usuario"
    size="lg"
    centered
    no-footer
    header-bg-variant="dark"
    header-text-variant="light"
    @hidden="handleClose"
  >
    <div v-if="userDetail" class="user-detail-container">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img
            v-if="
              userDetail.photo_url && userDetail.photo_status === 'approved'
            "
            :src="userDetail.photo_url"
            :alt="userDetail.name"
            class="user-avatar"
          />
          <div v-else class="avatar-placeholder">
            <IconUser :size="64" />
          </div>
        </div>
        <h4 class="user-name">{{ userDetail.name }}</h4>
        <p class="user-email">{{ userDetail.email }}</p>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <!-- Birthdate -->
        <div class="info-card">
          <div class="info-icon">
            <IconCake :size="24" />
          </div>
          <div class="info-content">
            <span class="info-label">Fecha de Nacimiento</span>
            <span class="info-value">{{
              formatDate(userDetail.birthdate) || "No especificada"
            }}</span>
          </div>
        </div>

        <!-- Social Network -->
        <div class="info-card">
          <div class="info-icon">
            <IconBrandInstagram :size="24" />
          </div>
          <div class="info-content">
            <span class="info-label">Red Social</span>
            <div v-if="userDetail.social_network_name && userDetail.social_network_logo_url" class="social-info">
              <img
                :src="userDetail.social_network_logo_url"
                :alt="userDetail.social_network_name"
                class="social-logo"
              />
              <span class="info-value">{{ userDetail.nickname || "-" }}</span>
            </div>
            <span v-else class="info-value">No especificada</span>
          </div>
        </div>

        <!-- Registration Date -->
        <div class="info-card">
          <div class="info-icon">
            <IconCalendarEvent :size="24" />
          </div>
          <div class="info-content">
            <span class="info-label">Fecha de Registro</span>
            <span class="info-value">{{
              formatDate(userDetail.created_at)
            }}</span>
          </div>
        </div>
        <!-- Country -->
        <div class="info-card">
          <div class="info-icon">
            <img
              v-if="userDetail.country_slug"
              :src="flagUrl(userDetail.country_slug)"
              :alt="userDetail.country || 'Bandera'"
              class="country-flag"
            />
            <IconGlobe v-else :size="24" />
          </div>
          <div class="info-content">
            <span class="info-label">País</span>
            <span class="info-value">{{ userDetail.country || "-" }}</span>
          </div>
        </div>
      </div>

      <!-- Ban Info (if banned) -->
      <div v-if="userDetail?.banned_at" class="ban-section">
        <div class="ban-header">
          <IconAlertTriangle :size="24" class="ban-icon" />
          <h5 class="ban-title">Usuario Baneado</h5>
        </div>
        <div class="ban-content">
          <p class="ban-reason">
            {{ userDetail?.ban_reason || "Sin motivo especificado" }}
          </p>
          <p class="ban-date">
            Baneado el: {{ formatDate(userDetail?.banned_at) }}
          </p>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { groupService } from "@/services/group.service";
import { addPreloader, removePreloader } from "@/composables/usePreloader";
import type { User, UserDetailModalProps, UserDetailModalEmits } from "@/interfaces/groups.interface";
const { showUserDetail } = groupService;

//DATA
const userDetail = ref<User | null>(null);

//PROPS
const props = defineProps<UserDetailModalProps>();
const emit = defineEmits<UserDetailModalEmits>();

//COMPUTEDS
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

//MOUNTED
onMounted(() => {
  getUserDetail();
});


//METHODS
const handleClose = () => {
  isVisible.value = false;
  emit("close");
};

const getUserDetail = async () => {
  try {
    addPreloader();
    const response = await showUserDetail(props.user?.id as number);
    userDetail.value = response as User;
  } catch (error) {
    console.log(error);
  } finally {
    removePreloader();
  }
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "No disponible";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function flagUrl(slug?: string | null) {
  if (!slug) return ''
  const code = slug.toString().slice(0, 2).toLowerCase()
  return `https://flagcdn.com/w40/${code}.png`
}

</script>

<style scoped>
.user-detail-container {
  padding: 1rem;
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e4e4e7;
}

.avatar-wrapper {
  margin: 0 auto 1rem;
  width: 120px;
  height: 120px;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #00d9ff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
  border: 4px solid #3f3f46;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #18181b;
}

.user-email {
  font-size: 0.875rem;
  color: #71717a;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #00d9ff;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #71717a;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #18181b;
}

.country-flag {
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.06);
}

.social-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.approved {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Ban Section */
.ban-section {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.ban-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ban-icon {
  color: #ef4444;
}

.ban-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #991b1b;
}

.ban-content {
  padding-left: 2rem;
}

.ban-reason {
  font-size: 1rem;
  color: #991b1b;
  font-weight: 500;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.ban-date {
  font-size: 0.875rem;
  color: #b91c1c;
  font-style: italic;
  margin: 0;
}

.modal-footer-custom {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 2px solid #e4e4e7;
}

.btn-close-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
