<script setup lang="ts">
import type { AlbumRecord, RecordType } from "@mikka/cloudflare-utils";
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  initialAlbums: AlbumRecord[];
  total: number;
  apiUrl: string;
}>();

type Tab = RecordType;
const TABS: { key: Tab; label: string }[] = [
  { key: "track", label: "Tracks" },
  { key: "set", label: "Sets" },
  { key: "album", label: "Albums" },
];

const PAGE_SIZE = 24;

const activeTab = ref<Tab>("track");
const albums = ref<AlbumRecord[]>(props.initialAlbums);
const page = ref(1);
const hasMore = ref(props.initialAlbums.length < props.total);
const loading = ref(false);
const sentinel = ref<HTMLDivElement | null>(null);
const selected = ref<AlbumRecord | null>(null);
const flipped = ref(false);
// `settled` flattens the card out of its 3D (preserve-3d) context once the flip
// finishes — WebKit/iOS Safari won't render an <iframe> that has a preserve-3d
// ancestor, so the Spotify embed only mounts after we drop back to 2D.
const settled = ref(false);
const showEmbed = ref(false);

const spotifyEmbedUrl = computed(() => {
  if (!selected.value || selected.value.source !== "spotify") return null;
  const match = selected.value.url.match(/track\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator`;
});

// SoundCloud links are stored as on.soundcloud.com short links, which the player
// widget rejects. SoundCloud's oEmbed endpoint (CORS-enabled) resolves them to a
// canonical api.soundcloud.com/tracks/<id> URL that the widget accepts.
const soundcloudEmbedUrl = ref<string | null>(null);

async function resolveSoundcloud(album: AlbumRecord) {
  if (album.source !== "soundcloud") return;
  try {
    const res = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(album.url)}`
    );
    const data = (await res.json()) as { html?: string };
    const src = data.html?.match(/src="([^"]+)"/)?.[1];
    const resolved = src ? new URL(src).searchParams.get("url") : null;
    if (!resolved || selected.value?.id !== album.id) return;
    soundcloudEmbedUrl.value =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(resolved)}` +
      `&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false` +
      `&show_user=true&show_teaser=false&visual=false`;
  } catch {}
}

async function loadPage(tab: Tab, pageNum: number, append = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fetch(`${props.apiUrl}/albums?page=${pageNum}&limit=${PAGE_SIZE}&type=${tab}`);
    const data = await res.json() as { albums: AlbumRecord[]; total: number; hasMore: boolean };
    if (append) {
      albums.value.push(...data.albums);
    } else {
      albums.value = data.albums;
    }
    hasMore.value = data.hasMore;
    page.value = pageNum + 1;
  } catch {}
  loading.value = false;
}

async function switchTab(tab: Tab) {
  if (tab === activeTab.value) return;
  activeTab.value = tab;
  page.value = 1;
  await loadPage(tab, 0, false);
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  await loadPage(activeTab.value, page.value, true);
}

let settleTimer: ReturnType<typeof setTimeout>;

function open(album: AlbumRecord) {
  clearTimeout(settleTimer);
  selected.value = album;
  flipped.value = false;
  settled.value = false;
  showEmbed.value = false;
  soundcloudEmbedUrl.value = null;
  resolveSoundcloud(album);
  requestAnimationFrame(() => {
    setTimeout(() => { flipped.value = true; }, 80);
  });
  // After the 0.5s flip completes, flatten to 2D and mount the embed.
  settleTimer = setTimeout(() => {
    settled.value = true;
    showEmbed.value = true;
  }, 640);
}

function close() {
  clearTimeout(settleTimer);
  flipped.value = false;
  settled.value = false;
  showEmbed.value = false;
  soundcloudEmbedUrl.value = null;
  setTimeout(() => { selected.value = null; }, 320);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

let observer: IntersectionObserver | null = null;

onMounted(() => {
  window.addEventListener("keydown", onKey);
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMore();
  }, { rootMargin: "200px" });
  if (sentinel.value) observer.observe(sentinel.value);

  // Load initial tab from API (initialAlbums has no type filter)
  loadPage("track", 0, false);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  observer?.disconnect();
});
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in TABS"
      :key="tab.key"
      class="tab"
      :class="{ active: activeTab === tab.key }"
      @click="switchTab(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>

  <div class="grid">
    <div
      v-for="album in albums"
      :key="album.id"
      class="album"
      @click="open(album)"
    >
      <img
        :src="album.artUrl"
        :alt="`${album.title} by ${album.artist}`"
        loading="lazy"
      />
      <p class="title">{{ album.title }}</p>
      <p class="artist">{{ album.artist }}</p>
    </div>

    <div v-if="albums.length === 0 && !loading" class="empty">
      No {{ activeTab }}s yet.
    </div>
  </div>

  <!-- Infinite scroll sentinel -->
  <div ref="sentinel" class="sentinel">
    <span v-if="loading" class="loading">loading</span>
  </div>

  <!-- Flip modal -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="selected" class="modal-overlay" @click.self="close">
        <div class="modal-scene">
          <div class="modal-flipper" :class="{ flipped, settled }">
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
                <iframe
                  v-if="spotifyEmbedUrl && showEmbed"
                  :src="spotifyEmbedUrl"
                  class="media-embed spotify-embed"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                <iframe
                  v-if="soundcloudEmbedUrl && showEmbed"
                  :src="soundcloudEmbedUrl"
                  class="media-embed sc-embed"
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
                <a
                  :href="selected.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="info-link"
                >
                  Open in {{ selected.source === "spotify" ? "Spotify" : "SoundCloud" }} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0;
  padding: 0 32px;
  border-bottom: 1px solid hsl(var(--border));
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 16px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.tab:hover { color: hsl(var(--foreground)); }

.tab.active {
  color: hsl(var(--foreground));
  border-bottom-color: hsl(var(--foreground));
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  padding: 32px;
}

@media (min-width: 480px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
@media (min-width: 1400px) { .grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } }

.album { cursor: pointer; min-width: 0; }

.album img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  transition: opacity 0.15s;
}

.album:hover img { opacity: 0.8; }

.title {
  margin-top: 8px;
  font-size: 0.8rem;
  color: hsl(var(--foreground));
  overflow-wrap: break-word;
}

.artist {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  overflow-wrap: break-word;
}

.empty {
  grid-column: 1 / -1;
  padding: 80px 0;
  text-align: center;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.sentinel {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: hsl(var(--background) / 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
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

.modal-flipper.flipped { transform: rotateY(180deg); }

/*
 * Once the flip settles, drop the whole card back to a flat 2D context. The
 * back face is already visually upright at this point (flipper 180deg × face
 * 180deg = 0), so zeroing both transforms with no transition is seamless — but
 * it lets the Spotify <iframe> render, which WebKit refuses to do inside a
 * preserve-3d ancestor.
 */
.modal-flipper.settled {
  transform: none;
  transform-style: flat;
  transition: none;
}

.modal-flipper.settled .modal-front { display: none; }

.modal-flipper.settled .modal-back {
  position: relative;
  transform: none;
  backface-visibility: visible;
  -webkit-backface-visibility: visible;
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
  top: 0; left: 0; right: 0;
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
  top: 12px; right: 12px;
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

.modal-close:hover { color: hsl(var(--foreground)); }

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

.media-embed {
  width: 100%;
  border: none;
  border-radius: 12px;
  margin-top: 12px;
  display: block;
}

.spotify-embed { height: 80px; }
.sc-embed { height: 120px; }

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
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>
