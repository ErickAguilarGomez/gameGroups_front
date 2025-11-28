<template>
  <BTable
    :fields="visibleFields"
    :items="items"
    :isBusy="loading"
    responsive
    class="mb-0"
    hover
  >
    <template #table-busy>
      <div class="text-center my-2 text-primary">
        <BSpinner class="align-middle"></BSpinner>
        <strong class="ms-2">Cargando...</strong>
      </div>
    </template>
    <template #cell(start_date)="{ item }">
      {{ formatDate(item.start_date) }}
    </template>
    <template #cell(end_date)="{ item }">
      {{ formatDate(item.end_date) }}
    </template>
    <template #cell(actions)="{ item }">
      <div
        v-if="selectedTab === 'active'"
        class="d-flex gap-2 justify-content-end"
      >
        <BButton
          variant="link"
          class="p-0 text-info"
          @click="editQuestionary(item)"
          v-b-tooltip.hover="'Editar'"
        >
          <IconEdit :size="20" />
        </BButton>
        <BButton
          variant="link"
          class="p-0 text-danger"
          @click="deleteQuestionary(item)"
          v-b-tooltip.hover="'Eliminar'"
        >
          <IconTrash :size="20" />
        </BButton>
      </div>
    </template>
  </BTable>

  <ModalEditQuestionaryForm
    v-if="showEditModal && selectedQuestionary"
    :id="selectedQuestionary.id"
    @close="closeEditModal"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { addPreloader, removePreloader } from "@/composables/usePreloader";
import { formatDate } from "@/utils/formatters";
import { questionariesService } from "@/views/ceo/views/questionaries/Service/questionaries.service";
import ModalEditQuestionaryForm from "@/views/ceo/views/questionaries/components/ModalEditQuestionaryForm.vue";

import { fields } from "@/views/ceo/views/questionaries/data/fields.data";
import { Questionary } from "@/views/ceo/views/questionaries/interface/questionaries.interface";
import { useAlert } from "@/composables";

const props = defineProps({
  selectedTab: {
    type: String,
    default: "active",
  },
});

const { confirmDelete } = useAlert();

const items = ref<Questionary[]>([]);
const showEditModal = ref(false);
const selectedQuestionary = ref<Questionary | null>(null);
const loading = ref(false);

onMounted(() => {
  getQuestionaries();
});

watch(
  () => props.selectedTab,
  () => {
    getQuestionaries();
  }
);

const visibleFields = computed(() => {
  if (props.selectedTab === "inactive") {
    return fields.filter((field) => field.key !== "actions");
  }
  return fields;
});

const getQuestionaries = async () => {
  try {
    addPreloader();
    loading.value = true;
    const params = {
      status: props.selectedTab,
    };
    const response = await questionariesService.getQuestionaries(params);
    items.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    removePreloader();
    loading.value = false;
  }
};
const deleteQuestionary = async (questionary: Questionary) => {
  try {
    const result = await confirmDelete(questionary.title);
    if (!result) return;
    addPreloader();
    const params = {
      id: questionary.id,
    };
    const response = await questionariesService.deleteQuestionary(params);
    getQuestionaries();
    return response;
  } catch (error) {
    console.log(error);
  } finally {
    removePreloader();
  }
};
const editQuestionary = (questionary: Questionary) => {
  selectedQuestionary.value = questionary;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedQuestionary.value = null;
  getQuestionaries();
};
</script>
