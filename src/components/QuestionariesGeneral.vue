<template>
  <div class="questionaries-general">
    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary" />
      <p class="mt-2 text-muted">Cargando encuestas...</p>
    </div>

    <div v-else-if="questionaries.length === 0" class="text-center py-5">
      <p class="text-muted">No hay encuestas activas disponibles.</p>
    </div>

    <BRow v-else>
      <BCol
        v-for="questionary in questionaries"
        :key="questionary.id"
        md="6"
        lg="4"
        class="mb-4"
      >
        <QuestionaryCard
          :questionary="questionary"
          :selected-option-id="selectedOptions[questionary.id]"
          @vote="handleVote"
          @show-voters="openVotersModal"
        />
      </BCol>
    </BRow>

    <ShowVotesModal
      v-model="showVotersModal"
      :question-id="selectedQuestionId || undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { questionariesService } from "@/views/ceo/views/questionaries/Service/questionaries.service";
import { Questionary } from "@/views/ceo/views/questionaries/interface/questionaries.interface";
import { useAuthStore } from "@/stores/authStore";
import { useAlert } from "@/composables/useAlert";
import QuestionaryCard from "@/components/Questionaries/QuestionaryCard.vue";
import ShowVotesModal from "@/components/Questionaries/showVotesModal.vue";

const questionaries = ref<Questionary[]>([]);
const loading = ref(false);
const authStore = useAuthStore();
const { toast } = useAlert();

// Voting state
const selectedOptions = reactive<Record<number, number>>({});

// Voters modal state
const showVotersModal = ref(false);
const selectedQuestionId = ref<number | null>(null);

const isUser = computed(() => authStore.user?.role_id === 2);

const fetchQuestionaries = async () => {
  loading.value = true;
  try {
    const data = await questionariesService.getQuestionariesWithStats({
      status: "active",
      user_id: authStore.user!.id,
    });
    questionaries.value = data;

    data.forEach((q) => {
      if (q.user_question_id) {
        selectedOptions[q.id] = q.user_question_id;
      }
    });
  } catch (error) {
    console.error("Error fetching questionaries stats:", error);
  } finally {
    loading.value = false;
  }
};

const handleVote = async (questionaryId: number, questionId: number) => {
  if (!isUser.value) return;
  selectedOptions[questionaryId] = questionId;
  try {
    await questionariesService.vote({
      user_id: authStore.user!.id,
      question_id: questionId,
      questionary_id: questionaryId,
    });
    toast("Voto registrado exitosamente", "success");
    fetchQuestionaries();
  } catch (error) {
    console.error("Error voting:", error);
    toast("Error al registrar el voto", "error");
  }
};

const openVotersModal = (questionId: number) => {
  selectedQuestionId.value = questionId;
  showVotersModal.value = true;
};

onMounted(() => {
  fetchQuestionaries();
});
</script>

<style scoped>
.questionaries-general {
  padding: 1rem;
}

.text-muted {
  color: #94a3b8 !important;
}
</style>
