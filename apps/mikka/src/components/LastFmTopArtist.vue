<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const artist = ref<{ name: string; url: string; playcount: string; imageUrl: string } | null>(null);
let interval: ReturnType<typeof setInterval>;

async function fetch_() {
  try {
    const res = await fetch("/api/lastfm");
    const data = await res.json();
    if (data.topArtist) artist.value = data.topArtist;
  } catch {}
}

onMounted(() => { fetch_(); interval = setInterval(fetch_, 60000); });
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <a
    v-if="artist"
    :href="artist.url"
    target="_blank"
    rel="noopener"
    class="lfm-artist-card world-card"
  >
    <!-- Artist image -->
    <div class="lfm-artist-img" v-if="artist.imageUrl">
      <img :src="artist.imageUrl" :alt="artist.name" />
      <div class="lfm-artist-overlay" />
    </div>
    <div class="lfm-artist-img-placeholder" v-else />

    <div class="lfm-artist-gap" />

    <!-- Info row -->
    <div class="lfm-artist-row">
      <div class="lfm-artist-index">
        <img src="/icons/lastfm.svg" alt="" class="lfm-logo" />
      </div>
      <div class="lfm-artist-body">
        <span class="lfm-artist-label">top artist · 7d</span>
        <p class="lfm-artist-name">{{ artist.name }}</p>
        <p class="lfm-artist-sub">{{ artist.playcount }} plays</p>
      </div>
      <div class="lfm-artist-arrow">↗</div>
    </div>
  </a>
  <div v-else class="lfm-artist-card lfm-skeleton world-card" />
</template>

<style scoped>
.lfm-artist-card {
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
  transform: rotate(-1deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
}

.lfm-artist-card:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: rotate(0deg);
}

.lfm-artist-card:hover .lfm-artist-arrow { opacity: 1; transform: translate(1px, -1px); }
.lfm-artist-card:hover .lfm-artist-img img { transform: scale(1.04); }

.lfm-artist-img {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.lfm-artist-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.lfm-artist-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, hsl(var(--background) / 0.4) 100%);
}

.lfm-artist-img-placeholder {
  flex: 1 1 0;
  min-height: 0;
  background: hsl(var(--muted));
}

.lfm-artist-gap {
  flex: 0 0 1px;
  background: hsl(var(--border));
  margin: 0 10px;
}

.lfm-artist-row {
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 8px 8px 8px 0;
}

.lfm-artist-index {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-right: 1px solid hsl(var(--border));
  margin-right: 8px;
  flex-shrink: 0;
}

.lfm-logo {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  filter: invert(15%) sepia(90%) saturate(700%) hue-rotate(340deg) brightness(95%);
}

.lfm-artist-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
}

.lfm-artist-label {
  font-size: 0.45rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground) / 0.7);
}

.lfm-artist-name {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 0.9rem;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground) / 0.9);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lfm-artist-sub {
  font-size: 0.58rem;
  color: hsl(var(--muted-foreground));
}

.lfm-artist-arrow {
  font-size: 0.7rem;
  color: hsl(var(--muted-foreground));
  align-self: flex-start;
  padding-top: 2px;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.lfm-skeleton {
  background: hsl(var(--muted) / 0.4);
}
</style>
