<template>
  <div>
    <ModernTabs
      :tabs="tabs"
      :selected-tab="selectedTab"
      :show-icons="true"
      :show-numbers="true"
      @update:selected-tab="selectedTab = $event"
      @tab-change="handleTabChange"
    />
    
    <!-- Contenido del tab seleccionado -->
    <div v-if="selectedTab === 'announcement'">
      <StoreAnnouncement />
    </div>
    <div v-else-if="selectedTab === 'active'">Contenido de Anuncios Activos</div>
    <div v-else-if="selectedTab === 'next'">Contenido de Próximos Anuncios</div>
    <div v-else-if="selectedTab === 'inactive'">Contenido de Anuncios Inactivos</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted ,ref} from 'vue';
import ModernTabs from '@/components/ModernTabs.vue';
import { announcementService } from '@/views/ceo/services/announcement';
import { addPreloader,removePreloader } from '@/composables';
import StoreAnnouncement from './components/StoreAnnouncement.vue';
//DATA
const selectedTab = ref<string>("announcement");

const tabs = [
  {
    key: "announcement",
    label: "Crear",
    icon: "IconUsers",
  },
  {
    key: "active", 
    label: "Activos",
    icon: "IconPhoto",
  },
  {
    key: "next",
    label: "Proximos", 
    icon: "IconUserX",
  },
  {
    key: "inactive",
    label: "Inactivos", 
    icon: "IconUserOff",
  }

];

//MOUNTED

onMounted(() => {
    getAnnouncements();
});


//COMPUTED
const getAnnouncements = async () => {
  try {
    addPreloader();
    const response = await announcementService.getAnnouncements();
    console.log('Anuncios obtenidos:', response.data);
  } catch (error) {
    console.error('Error al obtener los anuncios:', error);
  }finally {
    removePreloader();
  }
};

//METHODS
const handleTabChange = (tab: any) => {
  selectedTab.value = tab.key;
};
</script>