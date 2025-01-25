<template>
  <div class="row mt-3">
    <div class="col-12 text-center">
      <!-- Suchformular -->
      <form @submit.prevent="handleSearch" class="d-flex justify-content-center">
        <!-- Suchfeld -->
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          maxlength="50"
          :placeholder="placeholder"
        />

        <!-- Filter Button nur anzeigen, wenn showFilter true ist -->
        <button v-if="showFilter" class="btn btn-image" type="button" @click="toggleFilter">
          <img
            :src="currentFilterIcon"
            width="96"
            height="61"
            class="oval-icon-responsive"
            alt="Filter Icon"
          />
        </button>

        <!-- Such-Button -->
        <button class="btn btn-image" type="submit">
          <img
            :src="currentSearchIcon"
            width="97"
            height="61"
            class="oval-icon-responsive"
            alt="Search Icon"
          />
        </button>
      </form>
    </div>

    <!-- Filter-Popup nur anzeigen, wenn showFilter true ist -->
    <FilterPopup
      v-if="isFilterVisible && showFilter"
      :filters="filters"
      @close="toggleFilter"
      @applyFilters="applyFilters"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import FilterPopup from './FilterPopup.vue'
import searchIcon from '../../src/assets/icons/search.webp'
import searchSelectedIcon from '../../src/assets/icons/searchSelected.webp'
import filterIcon from '../../src/assets/icons/filter.webp'
import filterSelectedIcon from '../../src/assets/icons/filterSelected.webp'

// Definiere Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  showFilter: {
    type: Boolean,
    default: false,
  },
})

// Lokaler Zustand
const searchQuery = ref(props.modelValue)
const isFilterVisible = ref(false)
const filters = ref({
  taste: [],
  effect: [],
  rating: null,
  price: 0,
  // Weitere dynamische Filtertypen können hier hinzugefügt werden
})

// Lade gespeicherte Filter aus localStorage beim Mounten
onMounted(() => {
  const savedFilters = localStorage.getItem('savedFilters')
  if (savedFilters) {
    try {
      // Mische Standardwerte mit gespeicherten Werten
      filters.value = { ...filters.value, ...JSON.parse(savedFilters) }
      handleSearch()
    } catch (e) {
      console.error('Fehler beim Parsen gespeicherter Filter:', e)
    }
  }
})

// Beobachte Änderungen am filters-Objekt und speichere sie im localStorage
watch(
  filters,
  (newFilters) => {
    localStorage.setItem('savedFilters', JSON.stringify(newFilters))
  },
  { deep: true },
)

// Emit für das Senden der Suchanfrage
const emit = defineEmits(['update:modelValue', 'search'])

const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim()
  // Emit 'search' Event mit der Suchanfrage und den Filtern
  emit('search', {
    query: trimmedQuery,
    filters: filters.value,
  })
}

// Toggle Filter-Modal
const toggleFilter = () => {
  if (props.showFilter) {
    isFilterVisible.value = !isFilterVisible.value
  }
}

// Empfange Filterdaten, setze sie in den Zustand und suche
const applyFilters = (newFilters) => {
  filters.value = newFilters
  handleSearch()
}

// Computed Property für das dynamische Search-Icon
const currentSearchIcon = computed(() => {
  return searchQuery.value.trim() ? searchSelectedIcon : searchIcon
})

// Computed Property für das dynamische Filter-Icon
const currentFilterIcon = computed(() => {
  return filtersActive.value ? filterSelectedIcon : filterIcon
})

// Prüfe, ob Filter aktiv sind für dynamische Anzeige des Filter-Icons
const filtersActive = computed(() => {
  const currentFilters = filters.value
  return Object.values(currentFilters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }
    if (typeof value === 'number') {
      // Betrachte 0 als "nicht aktiv" für Zahlen
      return value !== 0
    }
    return value !== null && value !== undefined && value !== ''
  })
})
</script>

<style scoped>
/* Stil für das Suchfeld */
.search-input {
  width: 500px;
  border-width: 2px;
  border-radius: 36px;
  border-color: #c06e52;
  border-style: solid;
  padding: 10px;
  font-size: 16px;
  transition: width 0.5s ease;
}

/* Oval-Icon-Stil mit sanftem Übergang */
.oval-icon-responsive {
  height: auto;
  display: block;
  transition: width 0.5s ease;
}

.oval-icon-responsive:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}

/* Responsive Anpassungen des Suchfelds */
@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
}

@media (max-width: 694px) {
  .search-input {
    width: 100%;
    max-width: 400px;
  }
}

/* Medienabfragen für Skalierung der Bilder */
@media (max-width: 1200px) {
  .oval-icon-responsive {
    width: 85px;
  }
}

@media (max-width: 1000px) {
  .oval-icon-responsive {
    width: 75px;
  }
}

@media (max-width: 800px) {
  .oval-icon-responsive {
    width: 65px;
  }
}

@media (max-width: 600px) {
  .oval-icon-responsive {
    width: 55px;
  }
}

@media (max-width: 420px) {
  .oval-icon-responsive {
    width: 45px;
  }
}
</style>
