<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const totalScrobbles = ref<string | null>(null);
let interval: ReturnType<typeof setInterval>;

async function fetchData() {
  try {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/lastfm`);
    const data = await res.json();
    if (data.user) totalScrobbles.value = data.user.totalScrobbles;
  } catch {}
}

onMounted(() => { fetchData(); interval = setInterval(fetchData, 60000); });
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <a
    href="https://www.last.fm/user/ms7m"
    target="_blank"
    rel="noopener"
    class="lastfm-card world-card"
  >
    <div class="lastfm-header">
      <span class="lastfm-service">
        <img src="/icons/lastfm.svg" alt="last.fm" class="lfm-logo" />
        last.fm
      </span>
      <span class="lastfm-arrow">↗</span>
    </div>

    <div class="lastfm-middle">
      <span class="lastfm-count" v-if="totalScrobbles">{{ totalScrobbles }}</span>
      <span class="lastfm-count-label">scrobbles</span>
    </div>
  </a>
</template>

<style scoped>
.lastfm-card {
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
  transform: rotate(-2deg);
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
  padding: 10px;
}

.lastfm-card:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.92);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: rotate(0deg);
}

.lastfm-card:hover .lastfm-arrow { opacity: 1; transform: translate(1px, -1px); }

.lastfm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.lastfm-service {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d51007;
}

.lfm-logo {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  filter: invert(15%) sepia(90%) saturate(700%) hue-rotate(340deg) brightness(95%);
}

.lastfm-arrow {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.lastfm-middle {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.lastfm-count {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.4rem;
  letter-spacing: -0.03em;
  color: hsl(var(--foreground));
  line-height: 1;
  white-space: nowrap;
}

.lastfm-count-label {
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}
</style>
