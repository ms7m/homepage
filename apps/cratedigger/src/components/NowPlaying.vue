<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Track {
  title: string;
  artist: string;
  artUrl: string;
  songUrl: string;
  progress: number;
}

type State = "playing" | "paused" | "hidden";

const track = ref<Track | null>(null);
const state = ref<State>("hidden");
let pausedAt: number | null = null;
let interval: ReturnType<typeof setInterval>;

async function fetchNowPlaying() {
  try {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/now-playing`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.isPlaying) {
      track.value = data;
      state.value = "playing";
      pausedAt = null;
    } else {
      if (state.value === "playing") {
        state.value = "paused";
        pausedAt = Date.now();
      } else if (state.value === "paused" && pausedAt !== null) {
        if (Date.now() - pausedAt >= 30_000) {
          state.value = "hidden";
          pausedAt = null;
        }
      }
    }
  } catch {}
}

onMounted(() => {
  fetchNowPlaying();
  interval = setInterval(fetchNowPlaying, 10000);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <Transition name="np">
    <a
      v-if="state !== 'hidden' && track"
      :href="track.songUrl"
      target="_blank"
      rel="noopener"
      class="np"
    >
      <img :src="track.artUrl" :alt="track.artist" class="np-art" :class="{ paused: state === 'paused' }" />
      <div class="np-body">
        <span class="np-badge">{{ state === "paused" ? "⏸" : "●" }} {{ state === "paused" ? "paused" : "live" }}</span>
        <span class="np-title">{{ track.title }}</span>
        <span class="np-artist">{{ track.artist }}</span>
        <div class="np-bar"><div class="np-fill" :style="{ width: `${track.progress}%` }" /></div>
      </div>
    </a>
  </Transition>
</template>

<style scoped>
.np {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(30, 215, 96, 0.25);
  background: hsl(var(--background) / 0.6);
  backdrop-filter: blur(8px);
  padding: 6px 10px 6px 6px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  min-width: 0;
}

.np:hover {
  border-color: rgba(30, 215, 96, 0.55);
  background: hsl(var(--background) / 0.9);
}

.np-art {
  width: 36px;
  height: 36px;
  object-fit: cover;
  flex-shrink: 0;
  transition: filter 0.3s;
}

.np-art.paused {
  filter: grayscale(0.6) brightness(0.75);
}

.np-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.np-badge {
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1ed760;
}

.np-title {
  font-size: 0.72rem;
  color: hsl(var(--foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-artist {
  font-size: 0.62rem;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-bar {
  height: 1px;
  background: rgba(30, 215, 96, 0.15);
  margin-top: 2px;
}

.np-fill {
  height: 100%;
  background: #1ed760;
  transition: width 10s linear;
}

.np-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.np-leave-active { transition: opacity 0.2s ease; }
.np-enter-from { opacity: 0; transform: translateY(6px); }
.np-leave-to   { opacity: 0; }
</style>
