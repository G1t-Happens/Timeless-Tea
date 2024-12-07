<template>
  <div class="col-md-4">
    <div class="card mb-4 shadow-sm fixed-card">
      <!-- Produktbild -->
      <img :src="product.image" class="card-img-top" />
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
        <p class="card-text">{{ product.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const fullStars = computed(() => Math.floor(props.product.averageRating))
const emptyStars = computed(() => 5 - fullStars.value)
</script>

<style scoped>
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

.fixed-card .card-title {
  font-size: 22pt;
  color: #9fa86d;
}

.categories-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-badge {
  background-color: #9fa86d;
  color: #fff;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 12px;
}
</style>
