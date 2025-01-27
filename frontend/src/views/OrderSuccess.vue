<template>
  <div class="order-success">
    <h1>Vielen Dank für Ihre Bestellung!</h1>
    <p>Ihre Bestellung war erfolgreich.</p>
    <p>
      Ihre Bestell-ID lautet: <strong>{{ orderId }}</strong
      >.
    </p>
    <p>
      Sie können Ihre Bestellungen unter
      <router-link :to="{ name: 'OrderDetail', params: { id: orderId } }">
        Bestelldetails
      </router-link>
      einsehen.
    </p>
    <router-link :to="{ name: 'LandingPage' }" class="btn btn-primary">Zurück zum Shop</router-link>
  </div>
</template>

<script setup>
defineProps({
  orderId: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.order-success {
  max-width: 800px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.order-success h1 {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 2rem;
  margin-bottom: 20px;
  color: #4a5043;
}

.order-success p {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
}

.order-success .btn-primary {
  margin-top: 20px;
}
</style>
