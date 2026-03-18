<script setup lang="ts">
import { useTheme } from "../composables/useTheme";
const { theme, toggle } = useTheme();
</script>

<template>
  <button class="toggle" @click="toggle" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
    <span v-if="theme === 'dark'">☀</span>
    <span v-else>☽</span>
  </button>
</template>

<style scoped>
.toggle {
  background: none;
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  font-size: 0.85rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  line-height: 1;
}

.toggle:hover {
  color: hsl(var(--foreground));
  border-color: hsl(var(--foreground) / 0.4);
}
</style>
