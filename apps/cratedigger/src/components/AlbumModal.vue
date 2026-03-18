<script setup lang="ts">
import type { AlbumRecord } from "@mikka/cloudflare-utils";
import { ref, computed, onMounted, onUnmounted } from "vue";

const selected = ref<AlbumRecord | null>(null);
const flipped = ref(false);

function open(album: AlbumRecord) {
  selected.value = album;
  flipped.value = false;
  requestAnimationFrame(() => {
    setTimeout(() => { flipped.value = true; }, 80);
  });
}

function close() {
  flipped.value = false;
  setTimeout(() => { selected.value = null; }, 320);
}

const spotifyEmbedUrl = computed(() => {
  if (!selected.value || selected.value.source !== "spotify") return null;
  const match = selected.value.url.match(/track\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator`;
});

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

onMounted(() => {
  window.addEventListener("keydown", onKey);
  // listen for clicks on album cells emitted from static HTML
  window.addEventListener("album-click", (e: Event) => {
    open((e as CustomEvent<AlbumRecord>).detail);
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="selected" class="modal-overlay" @click.self="close">
        <div class="modal-scene">
          <div class="modal-flipper" :class="{ flipped }">
            <div class="modal-face modal-front">
              <img :src="selected.artUrl" :alt="selected.title" />
            </div>
            <div class="modal-face modal-back">
              <button class="modal-close" @click="close" aria-label="Close">✕</button>
              <img :src="selected.artUrl" :alt="selected.title" class="back-art" />
              <div class="modal-info">
                <p class="info-eyebrow">{{ selected.source }}</p>
                <h2 class="info-title">{{ selected.title }}</h2>
                <p class="info-artist">{{ selected.artist }}</p>
                <p v-if="selected.album" class="info-album">{{ selected.album }}</p>
                <a :href="selected.url" target="_blank" rel="noopener noreferrer" class="info-link">
                  Open in {{ selected.source === "spotify" ? "Spotify" : "SoundCloud" }} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
        <!-- iframe lives outside preserve-3d so it renders correctly -->
        <Transition name="embed">
          <iframe
            v-if="spotifyEmbedUrl && flipped"
            :src="spotifyEmbedUrl"
            class="spotify-embed"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            frameborder="0"
          />
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: hsl(var(--background) / 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.modal-scene {
  perspective: 1200px;
  width: min(400px, 90vw);
}

.modal-flipper {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-flipper.flipped {
  transform: rotateY(180deg);
}

.modal-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  width: 100%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  overflow: hidden;
}

.modal-front img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.modal-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
}

.back-art {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  filter: brightness(0.35) saturate(0.5);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: hsl(var(--foreground) / 0.6);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 4px 6px;
  z-index: 1;
  line-height: 1;
  transition: color 0.15s;
}

.modal-close:hover {
  color: hsl(var(--foreground));
}

.modal-info {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-eyebrow {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
}

.info-title {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: hsl(var(--foreground));
}

.info-artist {
  font-size: 0.85rem;
  color: hsl(var(--foreground) / 0.7);
  margin-top: 2px;
}

.info-album {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.spotify-embed {
  width: min(400px, 90vw);
  height: 80px;
  border-radius: 8px;
  border: none;
  flex-shrink: 0;
}

.embed-enter-active {
  transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s;
}
.embed-leave-active {
  transition: opacity 0.15s ease;
}
.embed-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.embed-leave-to {
  opacity: 0;
}

.info-link {
  margin-top: 12px;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 1px;
  align-self: flex-start;
  transition: color 0.15s, border-color 0.15s;
}

.info-link:hover {
  color: hsl(var(--foreground));
  border-color: hsl(var(--foreground));
}

.overlay-enter-active { transition: opacity 0.2s ease; }
.overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }
</style>
