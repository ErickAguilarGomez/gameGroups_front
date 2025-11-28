<template>
  <div class="gamer-management-view">
    <BCard no-body class="gamer-card">
      <BCardBody class="gamer-card-body">
        <ModernTabs
          :tabs="tabs"
          :selected-tab="selectedTab"
          @update:selected-tab="selectedTab = $event"
        />
        <div v-if="selectedTab === 'create'" class="mt-4">
          <CreateQuestionariForm />
        </div>
        <div v-else class="mt-4">
          <QuestionariesTable :selected-tab="selectedTab" />
        </div>
      </BCardBody>
    </BCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CreateQuestionariForm from "@/views/ceo/views/questionaries/components/CreateQuestionariForm.vue";
import ModernTabs from "@/components/ModernTabs.vue";
import QuestionariesTable from "@/views/ceo/views/questionaries/components/QuestionariesTable.vue";

const selectedTab = ref("create");
const tabs = [
  {
    key: "create",
    label: "Crear Encuesta",
    icon: "IconPlus",
  },
  {
    key: "active",
    label: "Activas",
    icon: "IconCheck",
  },
  {
    key: "inactive",
    label: "Inactivas",
    icon: "IconX",
  },
];
</script>

<style scoped>
.gamer-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.gamer-card-body {
  background: #0f0f23;
  padding: 1.5rem;
}
</style>
