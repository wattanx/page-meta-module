<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <div>Nuxt module playground!</div>
</template>

<script lang="ts">
export default {
  middleware: "auth",
};
</script>
