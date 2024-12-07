<template>
  <div class="col-md-4">
    <div class="card mb-4 shadow-sm fixed-card">
      <!-- Produktbild -->
      <img :src="product.image" class="card-img-top" />
      <div class="card-body">
        <!-- Produktname -->
        <h5 class="card-title">{{ product.name }}</h5>

        <!-- Sternebewertung -->
        <div class="card-icons">
          <!-- Vollständige Sterne -->
          <img
            v-for="n in fullStars"
            :key="'full-star-' + n"
            src="../../src/assets/icons/starFull.png"
            alt="Voller Stern"
            class="card-rating"
          />
          <!-- Leere Sterne -->
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

// Die Produktdaten werden als Props übergeben
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

//Runden der Durchschnittsbewertung
const fullStars = computed(() => {
  return Math.floor(props.product.averageRating)
})

//Berechnung wie viele emptyStars noch angezeigt werden muessen
const emptyStars = computed(() => {
  return 5 - fullStars.value
})
</script>

<style scoped>
.products-section .card-text {
  color: #666;
}

.fixed-card {
  height: 600px;
  border: 2px solid #4a5043;
  border-radius: 15px;
  background-color: #f1e2c5;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.fixed-card .card-img-top {
  height: 150pt;
  object-fit: cover;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.fixed-card .card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fixed-card .card-title,
.fixed-card .card-text {
  margin-bottom: 0.5rem;
}

.fixed-card .card-title {
  font-size: 22pt;
  color: #9fa86d;
}

.card-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-rating {
  height: 20px;
  width: 20px;
}

.card-button {
  height: 50px;
  width: 50px;
}
</style>
