<template>
  <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-card">
  <div class="product-card">
    <div class="card mb-4 shadow-sm">
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
          <img
            v-for="n in fullStars"
            :key="'full-star-' + n"
            src="../../src/assets/icons/starFull.png"
            alt="Voller Stern"
            class="card-rating"
          />
          <img
            v-for="n in emptyStars"
            :key="'empty-star-' + n"
            src="../../src/assets/icons/starEmpty.png"
            alt="Leerer Stern"
            class="card-rating"
          />
          <p>({{ product.reviews }})</p>
        </div>

        <!-- Preis -->
        <p class="card-text">Ab {{ product.price }}€ erhältlich</p>

        <!-- Produktbeschreibung -->
        <div class="product-description">
          <p class="card-text">{{ product.description }}</p>
        </div>
      </div>

      <!-- Buttons für "Like" und "In den Warenkorb" -->
      <div class="bottom-buttons">
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
  </router-link>
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
.product-card {
  display: flex;
  text-decoration: none; /* Entferne den Unterstrich des Links */
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative; /* Wichtig für die Positionierung der Buttons */
}

/* Hintergrund, Schatten, und Rand für die Karte */
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 15px;
  background-color: #f1e2c5; /* Heller Beigeton für den Hintergrund */
  border: 2px solid #4a5043; /* Dunkles Grau für den Rand */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Sanfter Schatten für Tiefe */
  min-height: 500px; /* Mindesthöhe für die Karten */
  max-height: 500px; /* Mindesthöhe für die Karten */
  height: 100%; /* Die Karte füllt den gesamten verfügbaren Platz */
  position: relative; /* Damit die Buttons absolut positioniert werden können */
  overflow: hidden; /* Verhindert, dass der Inhalt über die Karte hinausgeht */
}

/* Das Produktbild */
.card-img-top {
  height: 150px; /* Einheitliche Höhe für das Bild */
  object-fit: cover; /* Bild füllt den Raum ohne Verzerrung */
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

/* Body der Karte */
.card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  padding: 16px; /* Etwas Innenabstand für das Layout */
  flex-grow: 1; /* Sorgt dafür, dass die Karte in vertikaler Richtung wächst */
  overflow: hidden; /* Verhindert das Überlaufen des Inhalts */
}

/* Titel des Produkts */
.card-title {
  font-size: 22pt;
  color: #9fa86d; /* Grüner Farbton für den Titel */
  margin-bottom: 8px; /* Abstand nach unten */
}

/* Die Kategorien als Badges */
.categories-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* Zeilenumbruch bei vielen Kategorien */
}

.category-badge {
  background-color: #9fa86d; /* Grüner Farbton für die Badges */
  color: #fff; /* Weiße Schrift */
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 12px;
}

/* Die Icons für die Sternebewertung und Buttons */
.card-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* Größe der Buttons */
.card-button {
  height: 50px;
  width: 50px;
}

/* Sternebewertung (Größe der Sterne) */
.card-rating {
  height: 20px;
  width: 20px;
}

/* Stil für die Preisangabe */
.card-text {
  font-size: 14px;
  color: #333; /* Dunklere Farbe für den Text */
  margin-bottom: 8px;
}

/* Stil für die Produktbeschreibung */
.product-description {
  flex-grow: 1; /* Sorgt dafür, dass die Beschreibung den restlichen Platz einnimmt */
  overflow: hidden; /* Verhindert das Überlaufen des Inhalts */
  max-height: 200px; /* Optional: Wenn du eine maximale Höhe für die Beschreibung festlegst */
}

/* Die Buttons immer ganz unten */
.bottom-buttons {
  position: absolute;
  bottom: 1px; /* Abstand zum unteren Rand der Karte */
  left: 16px; /* Optional: Abstand vom linken Rand */
  right: 16px; /* Optional: Abstand vom rechten Rand */
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
