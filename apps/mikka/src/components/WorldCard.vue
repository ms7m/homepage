<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  href: string;
  index: string;
  title: string;
  description: string;
  image?: string;
  credit?: string;
  cx?: number;
  cy?: number;
  rotate?: number;
}>();

const flipped = ref(false);

function toggleFlip(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  flipped.value = !flipped.value;
}
</script>

<template>
  <div class="card-scene" :style="`--rotate: ${props.rotate ?? 0}deg`">
    <div class="card-flipper" :class="{ flipped }">

      <!-- FRONT -->
      <a :href="href" class="world-card card-face card-front">
        <div class="card-image">
          <img v-if="image" :src="image" :alt="title" />
          <div v-else class="card-image-placeholder" />
        </div>
        <div class="card-gap" />
        <div class="card-row">
          <div class="card-index">{{ index }}</div>
          <div class="card-body">
            <p class="card-title">{{ title }}</p>
            <p class="card-sub">{{ description }}</p>
          </div>
          <div class="card-arrow">↗</div>
        </div>

        <!-- Info button — only shown if credit exists -->
        <button v-if="credit" class="info-btn" @click.prevent.stop="toggleFlip" aria-label="Image credit">
          i
        </button>
      </a>

      <!-- BACK -->
      <div class="world-card card-face card-back" @click="flipped = false">
        <div class="back-image">
          <img v-if="image" :src="image" :alt="title" />
        </div>
        <div class="back-content">
          <p class="back-label">Image credit</p>
          <p class="back-text">{{ credit }}</p>
          <button class="back-close" @click.stop="flipped = false">✕</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.card-scene {
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform: rotate(var(--rotate, 0deg));
  transition: transform 0.2s ease;
}

.card-scene:hover {
  transform: rotate(0deg);
}

.card-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-flipper.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* FRONT */
.card-front {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
  position: relative;
}

.card-front:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.card-front:hover .card-arrow { opacity: 1; transform: translate(1px, -1px); }
.card-front:hover .card-title { color: hsl(var(--foreground)); }
.card-front:hover .card-image img { transform: scale(1.03); }

.card-image {
  flex: 0 0 172px;
  overflow: hidden;
}

@media (max-width: 639px) {
  .card-image {
    flex: 0 0 130px;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .card-sub {
    font-size: 0.6rem;
  }
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background: hsl(var(--muted));
}

.card-gap {
  flex: 0 0 1px;
  background: hsl(var(--border));
  margin: 0 12px;
}

.card-row {
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 10px 10px 10px 0;
}

.card-index {
  writing-mode: vertical-rl;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: hsl(var(--muted-foreground));
  padding: 0 8px;
  border-right: 1px solid hsl(var(--border));
  margin-right: 10px;
  user-select: none;
}

.card-body {
  flex: 1;
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
  overflow-wrap: break-word;
}

.card-arrow {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  align-self: flex-start;
  padding-top: 2px;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

/* Info button */
.info-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.8);
  color: hsl(var(--muted-foreground));
  font-size: 0.6rem;
  font-style: italic;
  font-family: Georgia, serif;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("/cursors/Link Select.cur"), pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  line-height: 1;
  padding: 0;
}

.info-btn:hover {
  background: hsl(var(--foreground));
  color: hsl(var(--background));
  border-color: hsl(var(--foreground));
}

/* BACK */
.card-back {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  overflow: hidden;
  transform: rotateY(180deg);
  cursor: url("/cursors/Normal Select.cur"), default;
}

.back-image {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.back-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.4);
}

.back-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

.back-label {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin: 0 0 6px;
}

.back-text {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 0.85rem;
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: rgba(255,255,255,0.9);
  margin: 0;
}

.back-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.7rem;
  cursor: url("/cursors/Link Select.cur"), pointer;
  padding: 4px;
  transition: color 0.15s;
}

.back-close:hover {
  color: rgba(255,255,255,0.9);
}
</style>
