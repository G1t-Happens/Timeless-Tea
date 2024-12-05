<template>
  <header class="py-2">
    <div class="d-flex align-items-center justify-content-between w-100">
      <!-- w-100 hinzugefügt -->
      <!-- Control Icons für Settings -->
      <div class="d-flex align-items-center">
        <a href="/settings.html" class="me-3" aria-label="Settings">
          <img src="../../assets/icons/settings.png" alt="Login" class="round-icon-responsive" />
        </a>
      </div>
      <!-- Banner Logo -->
      <div class="logo-center">
        <RouterLink to="/">
          <button class="btn btn-image" type="button">
            <img
              src="../../assets/images/banner_logo.png"
              class="banner-logo-responsive"
              alt="Tea Logo"
            />
          </button>
        </RouterLink>
      </div>
      <!-- Control Icons für Login/ShoppingCart -->
      <div class="d-flex align-items-center">
        <a href="/login" class="me-3" aria-label="Login">
          <img src="../../assets/icons/account.png" alt="Login" class="round-icon-responsive" />
        </a>
        <a href="/search.html" aria-label="ShoppingCart">
          <img
            src="../../assets/icons/shopingcart.png"
            alt="ShoppingCart"
            class="round-icon-responsive"
          />
        </a>
      </div>
    </div>
  </header>
</template>

<script setup></script>

<style scoped>
header {
  background-image: url('../../assets/images/banner.png'); /* Banner setzen */
  background-size: cover; /* Bild skalieren, um den gesamten Header zu füllen */
  background-position: center; /* Bild zentrieren */
  background-repeat: no-repeat; /* Bild nicht wiederholen, falls es kleiner als der Screen ist */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Schatten für den Header */
}

header h1 {
  font-size: 2.5rem;
  color: #000000;
}
</style>
