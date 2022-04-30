<script setup lang="ts">
import IntegrationsList from "@/components/IntegrationsList.vue";
</script>

<template>
  <header></header>
  <main>
    <IntegrationsList />
  </main>
</template>

<style>
@import "@/assets/base.css";

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}
</style>
