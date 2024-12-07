<template>
  <div class="col-md-4">
    <div class="card mb-4 shadow-sm fixed-card">
      <!-- Produktbild -->
      <img :src="product.image" class="card-img-top" alt="Produktbild" />
      <div class="card-body">
        <!-- Produktname -->
        <h5 class="card-title">{{ product.name }}</h5>

        <!-- Kategorien als Badges -->
        <div class="categories-section mb-3">
          <span
            v-for="category in product.productCategories"
            :key="category.id"
            class="badge category-badge"
          >
            {{ category.name }}
          </span>
        </div>

        <!-- Sternebewertung -->
        <div class="card-icons">
          <!-- Darstellung der vollständigen Sterne -->
          <img
            v-for="n in fullStars"
            :key="'full-star-' + n"
            src="../../src/assets/icons/starFull.png"
            alt="Voller Stern"
            class="card-rating"
          />
          <!-- Darstellung der leeren Sterne -->
          <img
            v-for="n in emptyStars"
            :key="'empty-star-' + n"
            src="../../src/assets/icons/starEmpty.png"
            alt="Leerer Stern"
            class="card-rating"
          />
          <!-- Anzahl der Bewertungen -->
          <p>({{ product.reviews }})</p>
        </div>

        <!-- Preis -->
        <p class="card-text">Ab {{ product.price }}€ erhältlich</p>

        <!-- Produktbeschreibung -->
        <p class="card-text">{{ product.description }}</p>
        <!-- Buttons für "Like" und "In den Warenkorb" -->
        <div class="card-icons">
          <button class="btn btn-image" type="button">
            <img
              src="../../src/assets/icons/likeEmpty.png"
              alt="Tee nicht geliket."
              class="card-button me-4"
            />
          </button>
          <button class="btn btn-image" type="button">
            <img
              src="../../src/assets/icons/shopingcart.png"
              alt="Zum Einkaufswagen hinzufügen"
              class="card-button"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Eigenschaften (Props) definieren, die von der Elternkomponente übergeben werden
const props = defineProps({
  product: {
    type: Object, // Erwartet ein Produktobjekt
    required: true, // Pflichtfeld
  },
})

// Berechnete Eigenschaft: Anzahl der vollen Sterne basierend auf der Bewertung
const fullStars = computed(() => Math.floor(props.product.averageRating))

// Berechnete Eigenschaft: Anzahl der leeren Sterne, sodass die Summe immer 5 ergibt
const emptyStars = computed(() => 5 - fullStars.value)
</script>

<style scoped>
/* Hauptstil für die Kartenkomponente */
.fixed-card {
  height: 600px;
  border: 2px solid #4a5043; /* Dunkles Grau */
  border-radius: 15px; /* Abgerundete Ecken */
  background-color: #f1e2c5; /* Heller Beigeton */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Schatten für Tiefe */
}

/* Stil für das Produktbild */
.fixed-card .card-img-top {
  height: 150pt; /* Einheitliche Höhe */
  object-fit: cover; /* Bild wird skaliert, um den Platz auszufüllen */
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

/* Stil für den Kartentextbereich */
.fixed-card .card-body {
  display: flex; /* Flexbox für Layout */
  flex-direction: column; /* Elemente werden vertikal angeordnet */
  justify-content: space-between; /* Verteile Elemente gleichmäßig */
}

/* Stil für den Produktnamen */
.fixed-card .card-title {
  font-size: 22pt; /* Größere Schriftgröße */
  color: #9fa86d; /* Grünton passend zum Thema */
}

/* Stil für die Kategorien-Badges */
.categories-section {
  display: flex;
  flex-wrap: wrap; /* Zeilenumbruch bei mehreren Badges */
  gap: 8px; /* Abstand zwischen Badges */
}

.category-badge {
  background-color: #9fa86d; /* Grünton */
  color: #fff; /* Weiße Schrift */
  padding: 5px 10px; /* Innenabstand */
  font-size: 12px; /* Kleinere Schriftgröße */
  border-radius: 12px; /* Runde Form */
}

.card-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-button {
  height: 50px; /* Einheitliche Höhe */
  width: 50px; /* Einheitliche Breite */
}

.card-rating {
  height: 20px; /* Einheitliche Größe der Sterne */
  width: 20px;
}
</style>
