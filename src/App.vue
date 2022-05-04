<script setup lang="ts">
import IntegrationsList from "@/components/IntegrationsList.vue";
import SchedulesList from "@/components/SchedulesList.vue";
import { useAzureClient } from "@/services/azure/auth";

useAzureClient();
</script>

<template>
  <header></header>
  <main>
    <IntegrationsList />
    <SchedulesList />
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
