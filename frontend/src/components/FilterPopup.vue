<template>
  <!-- Header mit Filterüberschrift und Schließen-Button -->
  <div class="filter-header">
    <h2>Filteroptionen</h2>
    <button class="close-button" @click="emitClose" aria-label="Schließen">X</button>
  </div>

  <div class="filter-body" @mousedown="handleOutsideClick">
    <!-- Dynamische Kategorien -->
    <div class="dynamic-categories">
      <div v-for="(options, category) in dynamicCategories" :key="category" class="filter-item">
        <h3>{{ category }}</h3>
        <button class="filter-button" @click.stop="toggleDropdown(category)">▾</button>
        <div v-if="activeDropdown === category" class="dropdown-menu" @click.stop>
          <label v-for="option in options" :key="option.id">
            <input type="checkbox" v-model="localFilters[category]" :value="option.id" />
            {{ option.name }}
          </label>
        </div>
        <div v-if="localFilters[category]?.length" class="selected-options">
          <strong>Ausgewählt:</strong> {{ getSelectedNames(category).join(', ') }}
        </div>
      </div>
    </div>

    <!-- Bewertung und Preis (statisch) -->
    <div class="filter-row static-filters">
      <div class="filter-item">
        <h3>Bewertung</h3>
        <button class="filter-button" @click.stop="toggleDropdown('rating')">▾</button>
        <div v-if="activeDropdown === 'rating'" class="dropdown-menu" @click.stop>
          <label v-for="star in 5" :key="star">
            <input type="radio" v-model="localFilters.rating" :value="star.toString()" />
            {{ star }} Stern{{ star > 1 ? 'e' : '' }}
          </label>
        </div>
        <div v-if="localFilters.rating" class="selected-options">
          <strong>Ausgewählt:</strong> {{ localFilters.rating }} Stern{{
            localFilters.rating > 1 ? 'e' : ''
          }}
        </div>
      </div>

      <div class="filter-item">
        <h3>Preis</h3>
        <input class="price-input" type="range" v-model="localFilters.price" min="0" max="200" />
        <span v-if="localFilters.price > 0">{{ localFilters.price }} €</span>
        <span v-else class="infinity-symbol">∞</span>
      </div>
    </div>

    <!-- Aktionen (Anwenden & Zurücksetzen) -->
    <div class="filter-row filter-actions">
      <button class="save-button" @click="applyFiltersHandler">Anwenden</button>
      <button class="reset-button" @click="resetFilters">Reset All</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const emit = defineEmits(['close', 'applyFilters'])

// Local state ( rating und price sind statisch, da immer vorhanden und immer selber Werte)
const localFilters = reactive({
  rating: null,
  price: 0,
})

const categories = ref([])
const activeDropdown = ref(null)
const dynamicCategories = computed(() => {
  return categories.value.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = []
    }
    acc[category.type].push(category)
    return acc
  }, {})
})

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

watch(
  () => props.filters,
  (newFilters) => {
    for (const category in dynamicCategories.value) {
      localFilters[category] = newFilters[category] || []
    }
    localFilters.rating = newFilters.rating || null
    localFilters.price = newFilters.price || 0
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    const response = await axios.get('/api/category/')
    categories.value = response.data
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters')) || {}
    for (const category of Object.keys(dynamicCategories.value)) {
      localFilters[category] = savedFilters[category] || []
    }
    localFilters.rating = savedFilters.rating || null
    localFilters.price = savedFilters.price || 0
  } catch (error) {
    console.error('Error fetching categories:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der Kategorien!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
})

const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const handleOutsideClick = (event) => {
  if (!event.target.closest('.dropdown-menu') && !event.target.closest('.filter-button')) {
    closeDropdown()
  }
}

const getSelectedNames = (category) => {
  return (dynamicCategories.value[category] || [])
    .filter((item) => localFilters[category]?.includes(item.id))
    .map((item) => item.name)
}

const applyFiltersHandler = () => {
  emit('applyFilters', {
    ...localFilters,
    categories: Object.keys(dynamicCategories.value).reduce((acc, category) => {
      return acc.concat(localFilters[category] || [])
    }, []),
  })
  emit('close')
}

const resetFilters = () => {
  for (const category of Object.keys(dynamicCategories.value)) {
    localFilters[category] = []
  }
  localFilters.rating = null
  localFilters.price = 0
  emit('applyFilters', {
    categories: [],
    price: localFilters.price,
    rating: localFilters.rating,
  })
}

const emitClose = () => {
  emit('close')
}
</script>

<style scoped>
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
}

.filter-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

.dynamic-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
}

.static-filters {
  border-top: 1px solid #ccc;
  padding-top: 10px;
}

.filter-item {
  flex: 1 1 calc(50% - 10px);
  text-align: left;
}

.filter-button {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 5px;
}

.dropdown-menu {
  background: #f9f9f9;
  border: 1px solid #999;
  border-radius: 6px;
  padding: 15px;
  position: absolute;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 200px;
}

.selected-options {
  margin-top: 6px;
  margin-left: 6px;
  color: #555;
}

.price-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.save-button {
  flex: 1;
  text-align: center;
  background: #666;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
}

.reset-button {
  flex: 1;
  text-align: center;
  background: #bbb;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
}

.infinity-symbol {
  font-size: 28px;
  font-weight: 500;
  color: #000000;
}
</style>
