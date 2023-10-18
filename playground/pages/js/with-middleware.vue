<script setup>
import { ref } from "vue";
definePageMeta({
  middleware: "redirect",
});
const count = ref(0);
</script>

<template>
  <div>PageMeta</div>
</template>
