<script setup lang="ts">
defineProps<{
  href: string;
  label: string;
  handle: string;
  icon: string; // path to public icon svg
  rotate?: number;
  accentColor?: string;
}>();
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener"
    class="social-card world-card"
    :style="`--rotate: ${rotate ?? 0}deg; --accent: ${accentColor ?? 'hsl(var(--foreground))'}`"
  >
    <div class="social-index">
      <img :src="icon" :alt="label" class="social-icon" />
    </div>
    <div class="social-body">
      <p class="social-label">{{ label }}</p>
      <p class="social-handle">{{ handle }}</p>
    </div>
    <div class="social-arrow">↗</div>
  </a>
</template>

<style scoped>
.social-card {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transform: rotate(var(--rotate, 0deg));
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
}

.social-card:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  transform: rotate(0deg);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.social-card:hover .social-arrow { opacity: 1; transform: translate(1px, -1px); }
.social-card:hover .social-label { color: var(--accent); }

.social-index {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-right: 1px solid hsl(var(--border));
  flex-shrink: 0;
}

.social-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  opacity: 0.5;
  /* force mono — invert to white in dark mode via CSS variable */
  filter: var(--icon-filter, none);
  transition: opacity 0.15s ease;
}

.social-card:hover .social-icon { opacity: 1; }

.social-body {
  flex: 1;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}

.social-label {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground) / 0.85);
  transition: color 0.15s ease;
  line-height: 1.2;
}

.social-handle {
  font-size: 0.65rem;
  color: hsl(var(--muted-foreground));
  letter-spacing: 0.02em;
}

.social-arrow {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  padding: 10px 10px 0 0;
  align-self: flex-start;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>
