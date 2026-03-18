<script setup lang="ts">
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button class="about-card world-card" @click="emit('click')">
    <div class="card-index">00</div>
    <div class="card-body">
      <p class="card-title">About</p>
      <p class="card-sub">hi hi</p>
    </div>
    <div class="card-arrow">↗</div>
  </button>
</template>

<style scoped>
.about-card {
  display: flex;
  align-items: stretch;
  width: 160px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-align: left;
  color: inherit;
  font-family: inherit;
  overflow: hidden;
  transform: rotate(-2deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
}

.about-card:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  transform: rotate(0deg);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.about-card:hover .card-arrow {
  opacity: 1;
  transform: translate(1px, -1px);
}

.about-card:hover .card-title {
  color: hsl(var(--foreground));
}

.card-index {
  writing-mode: vertical-rl;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: hsl(var(--muted-foreground));
  padding: 14px 8px;
  border-right: 1px solid hsl(var(--border));
  user-select: none;
}

.card-body {
  flex: 1;
  padding: 14px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}

.card-title {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground) / 0.85);
  transition: color 0.15s ease;
  line-height: 1.2;
}

.card-sub {
  font-size: 0.65rem;
  color: hsl(var(--muted-foreground));
  letter-spacing: 0.02em;
}

.card-arrow {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  padding: 10px 10px 0 0;
  align-self: flex-start;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>
