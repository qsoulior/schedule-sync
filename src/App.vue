<script setup lang="ts">
import LayoutHeader from "@/components/LayoutHeader.vue";
import IntegrationList from "@/components/IntegrationList.vue";
import SchedulesList from "@/components/SchedulesList.vue";
import { useAzureClient } from "@/services/azure/auth";
import { store as azureStore } from "@/services/azure/store";

useAzureClient();
</script>

<template>
  <LayoutHeader />
  <main
    class="container md:px-5 py-10 flex items-start justify-center flex-wrap md:flex-nowrap gap-5 lg:gap-10 mx-auto"
  >
    <IntegrationList />
    <SchedulesList class="flex-initial" v-if="azureStore.account" />
  </main>
</template>

<style>
@import url("@/assets/base.css");

#app {
  font-weight: normal;
}
</style>
