<template>
  <div class="filter-popup">
    <!-- Header mit Filterüberschrift und Schließen-Button -->
    <div class="filter-header">
      <h2>Filteroptionen</h2>
      <!-- Schließen Button -->
      <button class="close-button" @click="emit('close')">X</button>
    </div>

    <div class="filter-body">
      <!-- Geschmack und Wirkung -->
      <div class="filter-row">
        <!-- Geschmack Filter -->
        <div class="filter-item">
          <h3>Geschmack</h3>
          <button class="filter-button" ref="tasteButton" @click="toggleDropdown('taste')">
            ▾
          </button>
          <div v-if="activeDropdown === 'taste'" class="dropdown-menu">
            <!-- Geschmack-Optionen -->
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="fruchtig" />
              Fruchtig</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="würzig" /> Würzig</label
            >
            <label><input type="checkbox" v-model="localFilters.taste" value="süß" /> Süß</label>
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="blumig" /> Blumig</label
            >
          </div>
          <!-- Ausgewählte Geschmack-Optionen anzeigen -->
          <div v-if="localFilters.taste.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.taste.join(', ') }}
          </div>
        </div>

        <!-- Wirkung Filter -->
        <div class="filter-item">
          <h3>Wirkung</h3>
          <button class="filter-button" ref="effectButton" @click="toggleDropdown('effect')">
            ▾
          </button>
          <div v-if="activeDropdown === 'effect'" class="dropdown-menu">
            <!-- Wirkung-Optionen -->
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="beruhigend" />
              Beruhigend</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="anregend" />
              Anregend</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="stärkend" />
              Stärkend</label
            >
          </div>
          <!-- Ausgewählte Wirkung-Optionen anzeigen -->
          <div v-if="localFilters.effect.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.effect.join(', ') }}
          </div>
        </div>
      </div>

      <!-- Bewertung und Preis -->
      <div class="filter-row">
        <!-- Bewertung Filter -->
        <div class="filter-item">
          <h3>Bewertung</h3>
          <button class="filter-button" ref="ratingButton" @click="toggleDropdown('rating')">
            ▾
          </button>
          <div v-if="activeDropdown === 'rating'" class="dropdown-menu">
            <!-- Bewertung-Optionen -->
            <label><input type="radio" v-model="localFilters.rating" value="1" /> 1 Stern</label>
            <label><input type="radio" v-model="localFilters.rating" value="2" /> 2 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="3" /> 3 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="4" /> 4 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="5" /> 5 Sterne</label>
          </div>
          <!-- Ausgewählte Bewertung anzeigen -->
          <div v-if="localFilters.rating" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.rating }} Sterne
          </div>
        </div>

        <!-- Preis Filter -->
        <div class="filter-item">
          <h3>Preis</h3>
          <!-- Preis Slider -->
          <input class="price-input" type="range" v-model="localFilters.price" min="0" max="100" />
          <span>{{ localFilters.price }} €</span>
        </div>
      </div>

      <!-- Herkunft -->
      <div class="filter-row">
        <div class="filter-item">
          <h3>Herkunft</h3>
          <!-- Herkunft Eingabefeld -->
          <input
            class="origin-input"
            v-model="localFilters.origin"
            type="text"
            placeholder="z.B. China, Indien"
          />
        </div>
        <!-- Aktionen Buttons (Speichern & Zurücksetzen) -->
        <div class="filter-actions">
          <button class="save-button" @click="applyFilters">Speichern</button>
          <button class="save-button" @click="resetFilters">Reset All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, defineEmits } from 'vue'

// Emit für close und applyFilters Events definieren
const emit = defineEmits(['close', 'applyFilters'])

// Const zum einsehen des Dropdown States
const activeDropdown = ref(null)

// Empfang der Filterwerte über Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

//TODO: Filter/Kategorien dynamisch aus der Datenbank laden

// Lokale Filter mit den Initialwerten setzen
const localFilters = reactive({
  taste: [],
  effect: [],
  rating: null,
  price: 50,
  origin: '',
})

// Synchronisieren der lokalen Filter mit den Prop-Werten
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.taste = newFilters.taste || []
    localFilters.effect = newFilters.effect || []
    localFilters.rating = newFilters.rating || null
    localFilters.price = newFilters.price || 50
    localFilters.origin = newFilters.origin || ''
  },
  { immediate: true },
)

// Funktion zum Umschalten der Dropdowns
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

// Filter anwenden und emitten
const applyFilters = () => {
  emit('applyFilters', { ...localFilters })
}

// Alle Filter zurücksetzen
const resetFilters = () => {
  localFilters.taste = []
  localFilters.effect = []
  localFilters.rating = null
  localFilters.price = 50
  localFilters.origin = ''
  applyFilters()
}
</script>

<style scoped>
/* Container für die Filter-Optionen */
.filter-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* Header der Filter-Popups */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

/* Schließen Button */
.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* Filterbereich */
.filter-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Layout für Filterzeilen */
.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

/* Filteritem */
.filter-item {
  flex: 1;
  text-align: center;
}

/* Filterbutton */
.filter-button {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

/* Dropdown-Menü */
.dropdown-menu {
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  position: absolute;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 160px;
}

/* Ausgewählte Optionen */
.selected-options {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}

/* Preis-Slider */
.price-input {
  width: 100%;
}

/* Herkunft Eingabefeld */
.origin-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Action-Buttons */
.filter-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
  box-sizing: border-box;
}

/* Save-Button */
.save-button {
  max-width: 75%;
  flex: 1;
  text-align: center;
  background: #666;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
