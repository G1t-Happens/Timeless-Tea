<template>
  <div class="row mt-3">
    <div class="col-12 text-center">
      <form @submit.prevent="handleSearch" class="d-flex justify-content-center">
        <!-- Such-Eingabefeld -->
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Finde deinen Tee..."
          alt="Search Field"
        />

        <!-- Suchen Button -->
        <button class="btn btn-image" type="submit">
          <img
            src="../../src/assets/icons/search.png"
            class="oval-icon-responsive"
            alt="Search Icon"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const emit = defineEmits(['search'])

// Suchfunktion ausführen und Ereignis auslösen
const handleSearch = () => {
  emit('search', searchQuery.value.trim()) // Suchabfrage senden (auch leerer Wert möglich)
}
</script>

<style scoped>
.search-input {
  width: 500px;
  border-width: 2px;
  border-radius: 36px;
  border-color: #c06e52;
  border-style: solid;
}
</style>
