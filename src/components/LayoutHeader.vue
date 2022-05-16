<script setup lang="ts">
import IconGithub from "@/components/icons/IconGithub.vue";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconSun from "@/components/icons/IconSun.vue";
import { ref } from "vue";

enum Theme {
  Dark,
  Light,
}
const currentTheme = ref<Theme>(Theme.Light);

const storedTheme: string | null = localStorage.getItem("theme");
if (storedTheme) {
  if (storedTheme === "dark") {
    currentTheme.value = Theme.Dark;
    document.documentElement.classList.add("dark");
  }
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  currentTheme.value = Theme.Dark;
  document.documentElement.classList.add("dark");
}

function setTheme(theme: Theme) {
  if (theme === Theme.Dark) {
    currentTheme.value = Theme.Dark;
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
  } else {
    currentTheme.value = Theme.Light;
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  }
}
</script>

<template>
  <header
    class="flex items-center justify-between border-b dark:border-zinc-800 border-zinc-200 dark:bg-zinc-800/25 bg-zinc-50/25 py-3 px-5 lg:px-10 xl:px-14"
  >
    <div class="text-lg dark:text-sky-300 text-sky-400">Schedule Sync</div>
    <div class="flex items-center gap-3">
      <button>
        <IconSun
          class="hover:dark:stroke-sky-300 hover:stroke-sky-400 w-6 h-6"
          v-if="currentTheme === Theme.Dark"
          @click="setTheme(Theme.Light)"
        />
        <IconMoon class="hover:dark:stroke-sky-300 hover:stroke-sky-400 w-6 h-6" v-else @click="setTheme(Theme.Dark)" />
      </button>
      <a href="https://github.com/1asagne/schedule-sync" target="_blank">
        <IconGithub class="h-8 w-8 hover:dark:fill-sky-300 hover:fill-sky-400" />
      </a>
    </div>
  </header>
</template>
