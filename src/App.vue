<script setup lang="ts">
import LayoutHeader from "@/components/LayoutHeader.vue";
import AccountList from "@/components/AccountList.vue";
import SchedulesList from "@/components/SchedulesList.vue";
import { useGraphClient } from "@/composables/graph/auth";
import { useGoogleClient } from "@/composables/google/auth";
import { accountStore } from "@/stores/account";

useGraphClient();
useGoogleClient();
</script>

<template>
  <LayoutHeader />
  <main
    class="container md:px-5 py-10 flex items-start justify-center flex-wrap md:flex-nowrap gap-5 lg:gap-10 mx-auto"
  >
    <AccountList />
    <SchedulesList class="flex-initial" v-if="accountStore.selected !== undefined" />
  </main>
</template>

<style>
@import url("@/assets/base.css");
</style>
