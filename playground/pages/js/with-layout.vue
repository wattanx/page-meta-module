<script setup>
definePageMeta({
  layout: "test-layout",
  middleware: ["auth"],
});
</script>

<template>
  <div>
    <div>Nuxt module playground!</div>
    <NuxtLink to="/js/with-middleware">with-middleware</NuxtLink>
  </div>
</template>
