<template>
  <div>Nuxt module playground!</div>
</template>

<script lang="ts">
import { defineComponent } from "#imports";
export default defineComponent({
  middleware: "auth",
  setup() {
    const count = ref(0);
    return { count };
  },
});
</script>
