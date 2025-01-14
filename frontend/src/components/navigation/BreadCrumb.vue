<template>
  <nav class="breadcrumb">
    <ul class="breadcrumb__list">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.path"
        :class="['breadcrumb__item', { 'breadcrumb__item--active': isLast(index) }]"
      >
        <router-link v-if="!isLast(index)" :to="crumb.path" class="breadcrumb__link">
          {{ crumb.label }}
        </router-link>
        <span v-else class="breadcrumb__text">{{ crumb.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Dynamisch Breadcrumbs erstellen
const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(Boolean) // Filtere leere Segmente
  let breadcrumbArray = []
  let i = 0

  while (i < pathArray.length) {
    const segment = pathArray[i]
    let path = '/' + pathArray.slice(0, i + 1).join('/')
    let label = segment // Standardmäßig das Segment als Label

    // Überprüfe, ob es ein Route-Match gibt und ob das nächste Segment eine numerische ID ist
    const routeMatch = route.matched.find((r) => r.path === path)
    if (routeMatch && routeMatch.meta.breadcrumb) {
      label = routeMatch.meta.breadcrumb
    }

    if (i + 1 < pathArray.length && !isNaN(pathArray[i + 1])) {
      label += `#${pathArray[i + 1]}` // Füge die ID zum Label hinzu
      path += `/${pathArray[i + 1]}` // Füge die ID zum Pfad hinzu
      i++ // Skip the next segment because it is a numeric ID that has been processed
    }

    breadcrumbArray.push({ label, path })
    i++
  }

  // Füge die Root-Breadcrumb hinzu
  return [{ label: 'TeeShop', path: '/' }, ...breadcrumbArray]
})

// Prüfen, ob der aktuelle Breadcrumb der letzte ist
const isLast = (index) => index === breadcrumbs.value.length - 1
</script>

<style scoped>
/* Breadcrumb Container */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-top: 20px; /* Abstand oben und unten */
  margin-left: 20px; /* Abstand oben und unten */
  font-size: 18px;
  font-weight: 500;
  color: #495057; /* Neutraler Dunkelgrau-Ton */
}

.breadcrumb__list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 12px; /* Moderner Abstand zwischen Breadcrumb-Elementen */
}

.breadcrumb__item {
  position: relative;
  display: flex;
  align-items: center;
}

.breadcrumb__item:not(:last-child)::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background-color: #adb5bd; /* Dezenter Pfeil-Farbton */
  clip-path: polygon(100% 50%, 0 100%, 0 0); /* Pfeilform */
  margin-left: 12px;
  margin-right: 12px;
  transition: background-color 0.3s ease;
}

/* Link Styling */
.breadcrumb__link {
  text-decoration: none;
  color: #212529; /* Dunkleres Grau für Links */
  font-weight: 600;
  transition:
    color 0.3s ease,
    text-shadow 0.3s ease;
}

.breadcrumb__link:hover {
  color: #f03e3e; /* Kräftiges Rot für Hover-Effekte */
  text-shadow: 0 2px 6px rgba(240, 62, 62, 0.5); /* Moderner Schimmer-Effekt */
}

/* Text Styling */
.breadcrumb__text {
  color: #868e96; /* Dezenter Grau-Ton */
  font-weight: bold;
  cursor: default;
}
</style>
