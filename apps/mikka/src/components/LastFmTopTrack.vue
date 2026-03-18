<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const track = ref<{ name: string; artist: string; artUrl: string; url: string; playcount: string } | null>(null);
let interval: ReturnType<typeof setInterval>;

async function fetch_() {
  try {
    const res = await fetch("/api/lastfm");
    const data = await res.json();
    if (data.topTrack) track.value = data.topTrack;
  } catch {}
}

onMounted(() => { fetch_(); interval = setInterval(fetch_, 60000); });
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <a
    v-if="track"
    :href="track.url"
    target="_blank"
    rel="noopener"
    class="lfm-track-card world-card"
  >
    <!-- Album art -->
    <div class="lfm-track-art">
      <img v-if="track.artUrl" :src="track.artUrl" :alt="track.name" />
      <div v-else class="lfm-track-art-placeholder" />
    </div>

    <div class="lfm-track-gap" />

    <!-- Info row -->
    <div class="lfm-track-row">
      <div class="lfm-track-index">
        <img src="/icons/lastfm.svg" alt="" class="lfm-logo" />
      </div>
      <div class="lfm-track-body">
        <span class="lfm-track-label">top track · 7d</span>
        <p class="lfm-track-name">{{ track.name }}</p>
        <p class="lfm-track-sub">{{ track.artist }} · {{ track.playcount }}×</p>
      </div>
      <div class="lfm-track-arrow">↗</div>
    </div>
  </a>
  <div v-else class="lfm-track-card lfm-skeleton world-card" />
</template>

<style scoped>
.lfm-track-card {
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
  transform: rotate(1.5deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
}

.lfm-track-card:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: rotate(0deg);
}

.lfm-track-card:hover .lfm-track-arrow { opacity: 1; transform: translate(1px, -1px); }
.lfm-track-card:hover .lfm-track-art img { transform: scale(1.04); }

.lfm-track-art {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.lfm-track-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.lfm-track-art-placeholder {
  width: 100%;
  height: 100%;
  background: hsl(var(--muted));
}

.lfm-track-gap {
  flex: 0 0 1px;
  background: hsl(var(--border));
  margin: 0 10px;
}

.lfm-track-row {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  padding: 8px 8px 8px 0;
}

.lfm-track-index {
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

.lfm-track-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
}

.lfm-track-label {
  font-size: 0.45rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground) / 0.7);
}

.lfm-track-name {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 0.9rem;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground) / 0.9);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lfm-track-sub {
  font-size: 0.58rem;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lfm-track-arrow {
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
