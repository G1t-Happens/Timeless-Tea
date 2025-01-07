<template>
  <HeaderBar />
  <main>
    <RouterView />
  </main>
  <FooterBar />
</template>

<script setup>
import HeaderBar from '@/components/navigation/HeaderBar.vue'
import { RouterView } from 'vue-router'
import FooterBar from '@/components/navigation/FooterBar.vue'
</script>
