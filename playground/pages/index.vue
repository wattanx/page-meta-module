<script setup lang="ts">
definePageMeta({
  layout: "test-layout",
  middleware: ["auth"],
});
</script>

<template>
  <div>
    <div>Nuxt module playground!</div>
    <NuxtLink to="/page-meta">page-meta</NuxtLink>
  </div>
</template>
