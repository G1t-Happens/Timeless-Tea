<template>
  <HeaderBar />
  <main>
    <Breadcrumb />
    <RouterView />
  </main>
  <FooterBar />
</template>

<script setup>
import HeaderBar from '@/components/navigation/HeaderBar.vue'
import Breadcrumb from '@/components/navigation/BreadCrumb.vue'
import { RouterView } from 'vue-router'
import FooterBar from '@/components/navigation/FooterBar.vue'
</script>
