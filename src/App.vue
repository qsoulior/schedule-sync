<script setup lang="ts">
import LayoutHeader from "@/components/LayoutHeader.vue";
import IntegrationList from "@/components/IntegrationList.vue";
import SchedulesList from "@/components/SchedulesList.vue";
import { useAzureClient } from "@/services/azure/auth";

useAzureClient();
</script>

<template>
  <LayoutHeader />
  <main class="container py-10 flex items-start justify-center gap-10 mx-auto">
    <IntegrationList />
    <SchedulesList />
  </main>
</template>

<style>
@import url("@/assets/base.css");

#app {
  font-weight: normal;
}
</style>
