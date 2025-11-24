<template>
  <div class="country-select-container" ref="containerRef">
    <div class="input-wrapper" @click="toggleDropdown">
      <div
        class="selected-display form-control d-flex align-items-center justify-content-between"
        :class="{ 'is-invalid': !!error }"
      >
        <span v-if="modelValue" class="d-flex align-items-center gap-2">
          <span class="flag">{{ getFlag(modelSlug) }}</span>
          <span class="country-name">{{ modelValue }}</span>
        </span>
        <span v-else class="placeholder-text text-muted"
          >Selecciona tu país</span
        >
        <IconChevronDown
          :size="18"
          class="chevron"
          :class="{ rotated: isOpen }"
        />
      </div>
    </div>

    <div
      v-if="isOpen"
      class="dropdown-menu show w-100 p-0 mt-1 shadow-sm border-0 overflow-hidden"
    >
      <div class="p-2 search-container sticky-top bg-white border-bottom">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-light border-end-0">
            <IconSearch :size="14" />
          </span>
          <input
            ref="searchInput"
            type="text"
            class="form-control border-start-0 bg-light"
            placeholder="Buscar país..."
            v-model="searchQuery"
            @click.stop
          />
        </div>
      </div>

      <div class="countries-list custom-scrollbar">
        <div
          v-for="country in filteredCountries"
          :key="country.slug"
          class="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
          :class="{ active: modelSlug === country.slug }"
          @click="selectCountry(country)"
        >
          <span class="flag">{{ country.flag }}</span>
          <span class="text-truncate">{{ country.name }}</span>
          <IconCheck
            v-if="modelSlug === country.slug"
            :size="16"
            class="ms-auto text-primary"
          />
        </div>

        <div
          v-if="filteredCountries.length === 0"
          class="p-3 text-center text-muted small"
        >
          No se encontraron resultados
        </div>
      </div>
    </div>

    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { IconChevronDown, IconSearch, IconCheck } from "@tabler/icons-vue";

interface Country {
  name: string;
  slug: string;
  code?: string;
  flag?: string;
}

interface Props {
  modelValue?: string | null;
  modelSlug?: string | null;
  error?: string | null;
}

interface Emits {
  (e: "update:modelValue", value: string | null): void;
  (e: "update:modelSlug", value: string | null): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const searchQuery = ref("");
const countries = ref<Country[]>([]);
const containerRef = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);

// Fetch countries
onMounted(async () => {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2"
    );
    if (res.ok) {
      const data = await res.json();
      countries.value = data
        .map((c: any) => ({
          name: c?.name?.common ?? c?.name,
          slug: (c?.cca2 ?? slugify(c?.name?.common ?? c?.name))?.toString(),
          code: c?.cca2,
          flag: countryCodeToEmoji(c?.cca2),
        }))
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    }
  } catch (err) {
    console.error("Error al cargar países:", err);
  }

  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const filteredCountries = computed(() => {
  const query = normalizeText(searchQuery.value);
  if (!query) return countries.value;

  return countries.value.filter((c) => normalizeText(c.name).includes(query));
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
}

function selectCountry(country: Country) {
  emit("update:modelValue", country.name);
  emit("update:modelSlug", country.slug);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
}

function getFlag(slug?: string | null) {
  if (!slug) return "";
  const country = countries.value.find((c) => c.slug === slug);
  return country?.flag || "";
}

// Helpers
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function countryCodeToEmoji(code?: string) {
  if (!code) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

function normalizeText(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}
</script>

<style scoped>
.country-select-container {
  position: relative;
}

.selected-display {
  cursor: pointer;
  background-color: #fff;
  transition: all 0.2s;
  min-height: 42px; /* Match standard input height */
}

.selected-display:hover {
  border-color: #cbd5e0;
}

.chevron {
  transition: transform 0.2s ease;
  color: #6c757d;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  max-height: 300px;
  display: flex;
  flex-direction: column;
  z-index: 1050;
}

.countries-list {
  overflow-y: auto;
  flex: 1;
}

.dropdown-item {
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #e9ecef;
  color: #1a1a1a;
  font-weight: 500;
}

.flag {
  font-size: 1.2em;
  line-height: 1;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.placeholder-text {
  font-size: 1rem;
}
</style>
