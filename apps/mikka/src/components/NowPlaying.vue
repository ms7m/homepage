<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Track {
  title: string;
  artist: string;
  album: string;
  artUrl: string;
  songUrl: string;
  progress: number;
}

type State = "playing" | "paused" | "hidden";

const track = ref<Track | null>(null);
const state = ref<State>("hidden");
const flipped = ref(false);
let pausedAt: number | null = null;
let interval: ReturnType<typeof setInterval>;

async function fetchNowPlaying() {
  try {
    const res = await fetch("/api/now-playing");
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
          flipped.value = false;
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
    <div v-if="state !== 'hidden' && track" class="np-scene" style="--rotate: -3deg">
      <div class="np-flipper" :class="{ flipped }">

        <!-- FRONT -->
        <a :href="track.songUrl" target="_blank" rel="noopener" class="np-card np-face np-front world-card">
          <div class="np-art">
            <img :src="track.artUrl" :alt="track.album" :class="{ paused: state === 'paused' }" />
            <div class="np-badge" :class="{ 'np-badge--paused': state === 'paused' }">
              {{ state === 'paused' ? '⏸ PAUSED' : '● LIVE' }}
            </div>
          </div>

          <div class="np-gap" />

          <div class="np-row">
            <div class="np-index">♫</div>
            <div class="np-body">
              <p class="np-title">{{ track.title }}</p>
              <p class="np-sub">{{ track.artist }}</p>
            </div>
            <div class="np-arrow">↗</div>
          </div>

          <div class="np-progress">
            <div class="np-progress-fill" :style="{ width: `${track.progress}%` }" />
          </div>

          <!-- Info button -->
          <button v-if="state === 'playing'" class="np-info-btn" @click.prevent.stop="flipped = true" aria-label="Yes it's live">i</button>
        </a>

        <!-- BACK -->
        <div class="np-card np-face np-back world-card" @click="flipped = false">
          <div class="np-back-art">
            <img :src="track.artUrl" :alt="track.album" />
          </div>
          <div class="np-back-content">
            <p class="np-back-label">currently listening</p>
            <p class="np-back-text">yes, it's live.</p>
            <p class="np-back-track">{{ track.title }} — {{ track.artist }}</p>
            <button class="np-back-close" @click.stop="flipped = false">✕</button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.np-scene {
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform: rotate(var(--rotate, 0deg));
  transition: transform 0.2s ease;
}

.np-scene:hover {
  transform: rotate(0deg);
}

.np-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.np-flipper.flipped {
  transform: rotateY(180deg);
}

.np-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* FRONT */
.np-front {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(30, 215, 96, 0.3);
  background: hsl(var(--background) / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(30, 215, 96, 0.08), 0 0 24px rgba(30, 215, 96, 0.06);
  transition: border-color 0.2s ease, background 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
  position: relative;
}

.np-front:hover {
  border-color: rgba(30, 215, 96, 0.6);
  background: hsl(var(--background) / 0.92);
  box-shadow: 0 0 0 1px rgba(30, 215, 96, 0.15), 0 0 32px rgba(30, 215, 96, 0.1);
}

.np-front:hover .np-arrow { opacity: 1; transform: translate(1px, -1px); }
.np-front:hover .np-art img { transform: scale(1.03); }

.np-art {
  flex: 0 0 172px;
  overflow: hidden;
  position: relative;
}

.np-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease, filter 0.4s ease;
}

.np-art img.paused {
  filter: grayscale(0.6) brightness(0.8);
}

.np-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: #1ed760;
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 6px;
  backdrop-filter: blur(4px);
}

.np-badge--paused {
  color: hsl(var(--muted-foreground));
}

.np-info-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(30, 215, 96, 0.4);
  background: rgba(0, 0, 0, 0.5);
  color: #1ed760;
  font-size: 0.6rem;
  font-style: italic;
  font-family: Georgia, serif;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("/cursors/Link Select.cur"), pointer;
  transition: background 0.15s, border-color 0.15s;
  backdrop-filter: blur(4px);
  padding: 0;
  line-height: 1;
}

.np-info-btn:hover {
  background: #1ed760;
  color: #000;
  border-color: #1ed760;
}

.np-gap {
  flex: 0 0 1px;
  background: rgba(30, 215, 96, 0.2);
  margin: 0 12px;
}

.np-row {
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 10px 10px 6px 0;
}

.np-index {
  writing-mode: vertical-rl;
  font-size: 0.65rem;
  color: #1ed760;
  padding: 0 8px;
  border-right: 1px solid rgba(30, 215, 96, 0.2);
  margin-right: 10px;
  user-select: none;
}

.np-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}

.np-title {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground) / 0.85);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.np-sub {
  font-size: 0.65rem;
  color: hsl(var(--muted-foreground));
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.np-arrow {
  font-size: 0.75rem;
  color: #1ed760;
  align-self: flex-start;
  padding-top: 2px;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.np-progress {
  height: 2px;
  background: rgba(30, 215, 96, 0.15);
  flex-shrink: 0;
}

.np-progress-fill {
  height: 100%;
  background: #1ed760;
  transition: width 10s linear;
}

/* BACK */
.np-back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(30, 215, 96, 0.3);
  background: hsl(var(--background));
  overflow: hidden;
  cursor: url("/cursors/Normal Select.cur"), default;
}

.np-back-art {
  position: absolute;
  inset: 0;
}

.np-back-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.3) saturate(0.6);
}

.np-back-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

.np-back-label {
  font-size: 0.5rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  margin: 0 0 6px;
}

.np-back-text {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.4rem;
  letter-spacing: -0.03em;
  color: #1ed760;
  line-height: 1.1;
  margin: 0 0 8px;
}

.np-back-track {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.np-back-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 0.7rem;
  cursor: url("/cursors/Link Select.cur"), pointer;
  padding: 4px;
  transition: color 0.15s;
}

.np-back-close:hover { color: rgba(255,255,255,0.9); }

/* Transition */
.np-enter-active { transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.np-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.np-enter-from { opacity: 0; transform: rotate(var(--rotate, 0deg)) translateY(12px); }
.np-leave-to   { opacity: 0; transform: rotate(var(--rotate, 0deg)) translateY(-8px); }
</style>
