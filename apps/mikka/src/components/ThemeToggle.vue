<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

const { theme, toggle } = useTheme();
</script>

<template>
  <button class="theme-card world-card" @click.stop="toggle" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`">
    <div class="theme-icon">
      <!-- Sun -->
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="5" y2="12"/>
        <line x1="19" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
      </svg>
      <!-- Moon -->
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </div>
    <p class="theme-label">{{ theme === 'dark' ? 'light' : 'dark' }}</p>
  </button>
</template>

<style scoped>
.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: hsl(var(--muted-foreground));
  cursor: url("/cursors/Link Select.cur"), pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transform: rotate(2deg);
}

.theme-card:hover {
  background: hsl(var(--background) / 0.95);
  border-color: hsl(var(--foreground) / 0.3);
  color: hsl(var(--foreground));
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: rotate(0deg) scale(1.06);
}

.theme-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-card:hover .theme-icon {
  transform: rotate(20deg) scale(1.1);
}

.theme-icon svg {
  width: 100%;
  height: 100%;
}

.theme-label {
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
}
</style>
