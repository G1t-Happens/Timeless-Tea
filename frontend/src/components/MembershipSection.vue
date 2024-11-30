<template>
  <section class="member-section">
    <div class="text-container">
      <h2 class="headline-title mb-3">Jetzt Mitglied werden !</h2>
      <p>Verpasse keine unserer neuen Sorten und Angebote!</p>
      <p>Erlebe exklusive Teekreationen und genieße besondere Aktionen</p>
    </div>
    <div class="text-center">
      <RouterLink to="member">
        <button class="btn btn-image" type="button">
          <img src="../../src/assets/icons/membership.png" alt="Search Icon" />
        </button>
      </RouterLink>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.text-container {
  text-align: center;
}

.headline-title {
  font-size: 2rem;
  color: #9fa86d;
}
</style>
