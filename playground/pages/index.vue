<script setup lang="ts">
import { ref } from "vue";
definePageMeta({
  middleware: "auth",
});
const count = ref(0);
</script>

<template>
  <div>Nuxt module playground!</div>
</template>
