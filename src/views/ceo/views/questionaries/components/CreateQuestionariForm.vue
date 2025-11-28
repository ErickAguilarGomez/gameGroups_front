<template>
  <div class="create-questionnaire">
    <BCard no-body class="gamer-card">
      <BCardBody class="gamer-card-body">
        <Form ref="formRef" class="announcement-form">
          <fieldset
            :disabled="isSubmitting"
            style="border: 0; padding: 0; margin: 0"
          >
            <!-- Título -->
            <BRow class="mb-4">
              <BCol md="12">
                <p class="field-label">Título de la Encuesta</p>
                <Field rules="required|min:3" name="title">
                  <template #default="{ field, errorMessage }">
                    <BFormInput
                      id="title"
                      v-bind="field"
                      v-model="form.title"
                      placeholder="Ingresa el título de la encuesta"
                      :state="errorMessage ? false : null"
                      required
                    />
                    <BFormInvalidFeedback v-if="errorMessage">
                      {{ errorMessage }}
                    </BFormInvalidFeedback>
                  </template>
                </Field>
              </BCol>
            </BRow>

            <!-- Sección de Preguntas -->
            <BRow class="mb-4">
              <BCol md="6">
                <div style="height: 28px; margin-bottom: 0.5rem">
                  <div class="d-flex align-items-center h-100">
                    <p class="field-label mb-0">Preguntas</p>
                    <BButton
                      variant="primary"
                      size="sm"
                      @click="addQuestion"
                      v-b-tooltip.hover="'Desea agregar pregunta'"
                      class="btn-icon ms-2"
                    >
                      <IconPlus :size="18" />
                    </BButton>
                  </div>
                </div>

                <div
                  v-if="form.questions.length > 0"
                  v-for="(question, index) in form.questions"
                  :key="index"
                  class="mb-3"
                >
                  <div class="d-flex gap-2 align-items-start">
                    <div class="flex-grow-1">
                      <Field
                        :name="`questions[${index}].text`"
                        rules="required"
                        v-model="question.text"
                      >
                        <template #default="{ field, errorMessage }">
                          <BFormInput
                            v-bind="field"
                            v-model="question.text"
                            placeholder="Escribe tu pregunta aquí..."
                            :state="errorMessage ? false : null"
                          />
                          <BFormInvalidFeedback v-if="errorMessage">
                            {{ errorMessage }}
                          </BFormInvalidFeedback>
                        </template>
                      </Field>
                    </div>
                    <BButton
                      variant="outline-danger"
                      @click="removeQuestion(index)"
                      :disabled="form.questions.length <= 1"
                      class="btn-icon"
                    >
                      <IconTrash :size="18" />
                    </BButton>
                  </div>
                </div>
              </BCol>

              <!-- Columna Derecha: Fechas -->
              <BCol md="6">
                <BRow>
                  <BCol md="6" class="mb-3">
                    <p class="field-label">Fecha de Inicio</p>
                    <Field :rules="ruleStore.startDateRules" name="start_date">
                      <template #default="{ field, errorMessage }">
                        <CustomFlatPickr
                          id="start_date"
                          v-bind="field"
                          v-model="form.start_date"
                          placeholder="Selecciona fecha y hora de inicio"
                          :state="errorMessage ? false : null"
                          required
                        />
                        <BFormInvalidFeedback v-if="errorMessage">
                          {{ errorMessage }}
                        </BFormInvalidFeedback>
                      </template>
                    </Field>
                  </BCol>

                  <BCol md="6">
                    <p class="field-label">Fecha de Fin</p>
                    <Field :rules="endDateRules" name="end_date">
                      <template #default="{ field, errorMessage }">
                        <CustomFlatPickr
                          id="end_date"
                          v-bind="field"
                          v-model="form.end_date"
                          :config="dateTimeConfigEnd"
                          placeholder="Selecciona fecha y hora de fin"
                          :state="errorMessage ? false : null"
                          required
                        />
                        <BFormInvalidFeedback v-if="errorMessage">
                          {{ errorMessage }}
                        </BFormInvalidFeedback>
                      </template>
                    </Field>
                  </BCol>
                </BRow>
              </BCol>
            </BRow>

            <!-- Botones -->
            <BRow>
              <BCol md="12">
                <div class="d-flex gap-2 justify-content-end">
                  <BButton
                    variant="outline-secondary"
                    @click="resetForm"
                    :disabled="isSubmitting"
                  >
                    <IconX :size="16" class="me-1" />
                    Resetear
                  </BButton>

                  <BButton
                    variant="primary"
                    type="submit"
                    :disabled="isSubmitting"
                    @click="handleSubmit"
                  >
                    <BSpinner v-if="isSubmitting" small class="me-1" />
                    <IconCheck v-else :size="16" class="me-1" />
                    {{
                      isSubmitting
                        ? props.id
                          ? "Actualizando..."
                          : "Creando..."
                        : props.id
                        ? "Actualizar Encuesta"
                        : "Crear Encuesta"
                    }}
                  </BButton>
                </div>
              </BCol>
            </BRow>
          </fieldset>
        </Form>
      </BCardBody>
    </BCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { Form, Field } from "vee-validate";
import { useAlert } from "@/composables/useAlert";
import { addPreloader, removePreloader } from "@/composables";
import CustomFlatPickr from "@/components/CustomFlatPickr.vue";
import { useRuleStore } from "@/stores/ruleStore";
import { questionariesService } from "@/views/ceo/views/questionaries/Service/questionaries.service";
import { useAuthStore } from "@/stores/authStore";

//PROPS
const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
});

//STORES
const ruleStore = useRuleStore();
const authStore = useAuthStore();
const { toast } = useAlert();

//REFS
const dateTimeConfigEnd = ref<any>({});
const isSubmitting = ref(false);
const formRef = ref();
const form = ref({
  title: "",
  start_date: null as Date | string | null,
  end_date: null as Date | string | null,
  questions: [{ text: "" }],
});

//COMPUTED
const currentUser = computed(() => authStore.user as any);

// ASYNC FUNCTIONS
const getQuestionary = async () => {
  if (!props.id) return;
  try {
    addPreloader();
    const response = await questionariesService.getQuestionary({
      id: props.id,
    });

    const formData = {
      title: response.title,
      start_date: response.start_date,
      end_date: response.end_date,
      questions: response.questions?.length
        ? response.questions.map((q: any) => ({ text: q.question }))
        : [{ text: "" }],
    };
    form.value = formData;
    formRef.value.setValues(formData);
  } catch (error) {
    console.error(error);
    toast("Error al obtener la encuesta", "error");
  } finally {
    removePreloader();
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    addPreloader();
    const payload: any = {
      title: form.value.title,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      questions: form.value.questions.map((q) => ({ question: q.text })),
      user_id: currentUser.value.id,
    };

    if (props.id) {
      payload.id = props.id;
      await questionariesService.updateQuestionary(payload);
      toast("Encuesta actualizada exitosamente", "success");
    } else {
      await questionariesService.createQuestionary(payload);
      toast("Encuesta creada exitosamente", "success");
      resetForm();
    }
  } catch (error) {
    console.error(error);
    toast("Error al guardar la encuesta", "error");
  } finally {
    isSubmitting.value = false;
    removePreloader();
  }
};

const endDateRules = (value: unknown) => {
  return ruleStore.validateEndDate(value, form.value.start_date);
};

const addQuestion = () => {
  form.value.questions.push({ text: "" });
};

//SYNC FUNCTIONS
const removeQuestion = (index: number) => {
  if (form.value.questions.length > 1) {
    form.value.questions.splice(index, 1);
  }
};

const resetForm = () => {
  form.value = {
    title: "",
    start_date: null,
    end_date: null,
    questions: [{ text: "" }],
  };
  formRef.value?.resetForm();
};

//Mounted
onMounted(() => {
  if (props.id) {
    getQuestionary();
  }
});
// Watchers
watch(
  () => form.value.start_date,
  (newStart) => {
    if (newStart) {
      const d = new Date(newStart);
      if (!isNaN(d.getTime())) {
        dateTimeConfigEnd.value.minDate = d;
      }
    } else {
      dateTimeConfigEnd.value.minDate = new Date();
    }
  }
);
</script>

<style scoped>
.create-questionnaire {
  padding: 0;
  background: #0f0f23;
}

.field-label {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.announcement-form .form-control,
.announcement-form .form-select {
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.announcement-form .form-control:focus,
.announcement-form .form-select:focus {
  background: rgba(26, 26, 46, 0.8);
  border-color: #00d9ff;
  box-shadow: 0 0 0 0.2rem rgba(0, 217, 255, 0.25);
  color: #e2e8f0;
}

.announcement-form .form-control::placeholder {
  color: #64748b;
}

.btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

.btn-outline-secondary {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

.btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #e2e8f0;
}

.btn-outline-danger {
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
