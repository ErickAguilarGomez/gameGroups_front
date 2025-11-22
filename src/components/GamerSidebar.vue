<template>
  <aside class="sidebar-gamer" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-section">
        <component :is="logoIcon" :size="32" class="logo-icon" />
        <h1 v-if="!isCollapsed" class="logo-text">{{ title }}</h1>
      </div>
      <button @click="toggleCollapse" class="collapse-btn">
        <IconChevronLeft v-if="!isCollapsed" :size="20" />
        <IconChevronRight v-else :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="(section, index) in menuItems" :key="index" class="nav-section">
        <h3 v-if="section.title && !isCollapsed" class="section-title">
          {{ section.title }}
        </h3>
        <router-link
          v-for="item in section.items"
          :key="item.name"
          :to="item.route"
          class="nav-item"
          :class="{ 'has-badge': item.badge }"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="!isCollapsed">{{ item.label }}</span>
          <span v-if="item.badge && !isCollapsed" class="nav-badge">
            {{ item.badge }}
          </span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn">
        <IconLogout :size="20" />
        <span v-if="!isCollapsed">Cerrar Sesión</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  name: string
  label: string
  icon: string
  route: { name: string } | string
  badge?: string | number
}

interface MenuSection {
  title?: string
  items: MenuItem[]
}

interface Props {
  title: string
  logoIcon: string
  menuItems: MenuSection[]
  onLogout: () => void
}

const props = defineProps<Props>()
const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleLogout() {
  props.onLogout()
}
</script>

<style scoped>
.sidebar-gamer {
  width: 280px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-right: 1px solid rgba(0, 217, 255, 0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
}

.sidebar-gamer.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  color: #00d9ff;
  filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.5));
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  margin: 0;
}

.collapse-btn {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: #00d9ff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background: rgba(0, 217, 255, 0.2);
  border-color: #00d9ff;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #52525b;
  padding: 0 1.5rem;
  margin: 0 0 0.75rem 0;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: #a1a1aa;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  position: relative;
}

.sidebar-gamer.collapsed .nav-item {
  justify-content: center;
  padding: 0.875rem 0;
}

.nav-item span {
  font-size: 0.9375rem;
  font-weight: 500;
  flex: 1;
}

.nav-badge {
  background: #ef4444;
  color: white;
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.nav-item:hover {
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  border-left-color: #00d9ff;
}

.nav-item.router-link-active {
  background: linear-gradient(90deg, rgba(0, 217, 255, 0.15) 0%, transparent 100%);
  color: #00d9ff;
  border-left-color: #00d9ff;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: linear-gradient(180deg, #00d9ff 0%, #7c3aed 100%);
  border-radius: 4px 0 0 4px;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9375rem;
  font-weight: 500;
}

.sidebar-gamer.collapsed .logout-btn {
  justify-content: center;
  padding: 0.875rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-2px);
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.3);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.5);
}
</style>
