<template>
  <div v-if="tabs && tabs.length > 0" class="modern-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-item', { active: selectedTab === tab.key }]"
      @click="handleTabClick(tab.key)"
    >
      <component v-if="showIcons && tab.icon" :is="tab.icon" :size="20" />
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="showNumbers && getTabCount(tab) > 0" class="tab-badge">
        {{ getTabCount(tab) }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key: string
  label: string
  value?: number | string  // Ahora opcional, para contador
  icon?: string
}

interface Props {
  tabs: TabItem[]
  selectedTab: string  // Cambia a string (key)
  stats?: Record<string, number>
  showIcons?: boolean
  showNumbers?: boolean
}

interface Emits {
  (e: 'update:selectedTab', value: string): void
  (e: 'tab-change', tab: TabItem): void
}

const props = withDefaults(defineProps<Props>(), {
  showIcons: true,
  showNumbers: true
})

const emit = defineEmits<Emits>()

const handleTabClick = (key: string) => {
  emit('update:selectedTab', key)
  const tab = props.tabs.find(t => t.key === key)
  if (tab) {
    emit('tab-change', tab)
  }
}

const getTabCount = (tab: TabItem): number => {
  // Prioridad: tab.value > stats[tab.key] > 0
  if (tab.value !== undefined && typeof tab.value === 'number') {
    return tab.value
  }
  if (props.stats && props.stats[tab.key]) {
    return props.stats[tab.key]
  }
  return 0
}
</script>

<style scoped>
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
</style>