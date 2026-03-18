<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const scrobbles = ref<string | null>(null);
let interval: ReturnType<typeof setInterval>;

async function fetchData() {
  try {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/lastfm`);
    const data = await res.json();
    if (data.user) scrobbles.value = data.user.totalScrobbles;
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
    class="lfm"
  >
    <img src="/lastfm.svg" alt="last.fm" class="lfm-icon" />
    <div class="lfm-body">
      <span class="lfm-count">{{ scrobbles ?? "—" }}</span>
      <span class="lfm-label">scrobbles</span>
    </div>
  </a>
</template>

<style scoped>
.lfm {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.6);
  backdrop-filter: blur(8px);
  padding: 6px 10px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  flex-shrink: 0;
}

.lfm:hover {
  border-color: hsl(var(--foreground) / 0.3);
  background: hsl(var(--background) / 0.9);
}

.lfm-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  filter: invert(15%) sepia(90%) saturate(700%) hue-rotate(340deg) brightness(95%);
}

.lfm-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lfm-count {
  font-size: 0.75rem;
  font-family: "EditorialNew", Georgia, serif;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
  line-height: 1;
}

.lfm-label {
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #d51007;
}
</style>
