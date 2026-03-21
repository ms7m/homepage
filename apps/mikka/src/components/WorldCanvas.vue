<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { forceSimulation, forceCollide, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import WorldCard from "./WorldCard.vue";
import AboutCard from "./AboutCard.vue";
import NowPlaying from "./NowPlaying.vue";
import AboutModal from "./AboutModal.vue";
import DPad from "./DPad.vue";
import ThemeToggle from "./ThemeToggle.vue";
import LastFmCard from "./LastFmCard.vue";
import LastFmTopTrack from "./LastFmTopTrack.vue";
import LastFmTopArtist from "./LastFmTopArtist.vue";
import AceCard from "./AceCard.vue";
import SocialCard from "./SocialCard.vue";
import MetroCard from "./MetroCard.vue";
import PassportCard from "./PassportCard.vue";
import PassportSheet from "./PassportSheet.vue";
import SnoopySticker from "./SnoopySticker.vue";

interface Card {
  href: string;
  index: string;
  title: string;
  description: string;
  image?: string;
  credit?: string;
  cx: number;
  cy: number;
  rotate?: number;
}

interface ForceNode extends SimulationNodeDatum {
  id: string;
  w: number;
  h: number;
  // d3 mutates x/y
  x?: number;
  y?: number;
}

const props = defineProps<{ cards: Card[] }>();

const CARD_W = 200;
const CARD_H = 300;
const SMALL_W = 160;
const SMALL_H = 100; // about + location are short
const PADDING = 20; // extra gap between cards

const canvasRef = ref<HTMLDivElement | null>(null);
const offsetX = ref(0);
const offsetY = ref(0);
const worldOriginX = ref(0);
const worldOriginY = ref(0);
const aboutOpen = ref(false);
const passportOpen = ref(false);
const isMobile = ref(false);

const time = ref("");
function updateTime() {
  time.value = new Date().toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
let clockInterval: ReturnType<typeof setInterval>;

// Solved positions keyed by id
const positions = ref<Record<string, { x: number; y: number }>>({});
const nodeSizes = ref<Record<string, { w: number; h: number }>>({});

function buildNodes(vw: number, vh: number): ForceNode[] {
  const isMobile = vw < 640;
  const cardW = isMobile ? 150 : CARD_W;
  const cardH = isMobile ? 230 : CARD_H;
  const smallW = isMobile ? 140 : SMALL_W;
  const smallH = isMobile ? 80 : SMALL_H;

  const sx = vw * 0.28;
  const sy = vh * 0.28;

  if (isMobile) {
    // On mobile seed everything close to centre — d3 collide spreads them out
    // Project cards fanned slightly, small cards clustered nearby
    return [
      ...props.cards.map((c, i) => ({
        id: c.href,
        w: cardW,
        h: cardH,
        x: (c.cx / 400) * sx * 0.4,
        y: (c.cy / 400) * sy * 0.4,
      })),
      { id: "about", w: smallW, h: smallH, x: sx * 0.3, y: sy * 0.5 },
      { id: "now-playing", w: cardW, h: cardH, x: -sx * 0.3, y: sy * 0.6 },
      { id: "theme-toggle", w: 72, h: 72, x: -sx * 0.5, y: -sy * 0.5 },
      { id: "lastfm", w: 140, h: 80, x: sx * 0.4, y: -sy * 0.5 },
      { id: "lastfm-track", w: 140, h: 200, x: sx * 0.5, y: 0 },
      { id: "lastfm-artist", w: 150, h: 200, x: -sx * 0.4, y: -sy * 0.4 },
      { id: "ace", w: cardW, h: cardH, x: 0, y: -sy * 0.6 },
      { id: "twitter", w: smallW, h: smallH, x: sx * 0.2, y: sy * 0.7 },
      { id: "github", w: smallW, h: smallH, x: -sx * 0.2, y: -sy * 0.7 },
      { id: "linkedin", w: smallW, h: smallH, x: sx * 0.4, y: -sy * 0.6 },
      { id: "passport", w: 180, h: 255, x: -sx * 0.5, y: sy * 1.0 },
      { id: "snoopy", w: 100, h: 100, x: sx * 0.6, y: -sy * 0.8 },
    ];
  }

  return [
    ...props.cards.map((c) => ({
      id: c.href,
      w: cardW,
      h: cardH,
      x: (c.cx / 400) * sx,
      y: (c.cy / 400) * sy,
    })),
    { id: "about", w: smallW, h: smallH, x: sx * 0.9, y: sy * 0.8 },
    { id: "now-playing", w: cardW, h: cardH, x: 0, y: sy * 0.9 },
    { id: "theme-toggle", w: 80, h: 80, x: -sx * 0.9, y: sy * 0.8 },
    { id: "lastfm", w: 150, h: 80, x: -sx * 0.6, y: -sy * 0.9 },
    { id: "lastfm-track", w: 160, h: 220, x: -sx * 0.3, y: -sy * 1.0 },
    { id: "lastfm-artist", w: 170, h: 170, x: -sx * 0.7, y: -sy * 0.7 },
    { id: "ace", w: cardW, h: cardH, x: -sx * 0.4, y: -sy * 0.5 },
    { id: "twitter", w: smallW, h: smallH, x: sx * 0.7, y: -sy * 0.6 },
    { id: "linkedin", w: smallW, h: smallH, x: sx * 1.1, y: sy * 0.3 },
    { id: "github", w: cardW, h: smallH, x: -sx * 0.8, y: 0 },
    { id: "metrocard", w: 340, h: 215, x: sx * 2.2, y: -sy * 1.8 },
    { id: "passport", w: 260, h: 370, x: -sx * 1.5, y: sy * 1.2 },
    { id: "snoopy", w: 130, h: 130, x: sx * 1.3, y: sy * 0.6 },
  ];
}

function runLayout(vw: number, vh: number, resetOffset = true) {
  const nodes = buildNodes(vw, vh);
  const isMobile = vw < 640;
  const sx = vw * 0.28;
  const sy = vh * 0.28;

  const simulation = forceSimulation<ForceNode>(nodes)
    .force(
      "x",
      forceX<ForceNode>((d) => {
        if (isMobile) return 0;
        if (d.id === "metrocard") return sx * 2.2;
        if (d.id === "passport") return -sx * 1.5;
        if (d.id === "about") return vw * 0.25;
        if (d.id === "github") return -vw * 0.18;
        return 0;
      }).strength((d) => (d.id === "metrocard" || d.id === "passport" ? 1 : 0.12))
    )
    .force(
      "y",
      forceY<ForceNode>((d) => {
        if (isMobile) return 0;
        if (d.id === "metrocard") return -sy * 1.8;
        if (d.id === "passport") return sy * 1.6;
        if (d.id === "about" || d.id === "now-playing") return sy * 0.9;
        return 0;
      }).strength((d) => (d.id === "metrocard" || d.id === "passport" ? 1 : 0.12))
    )
    .force(
      "collide",
      forceCollide<ForceNode>((d) => Math.sqrt((d.w / 2 + PADDING) ** 2 + (d.h / 2 + PADDING) ** 2))
        .strength(1)
        .iterations(6)
    )
    .stop();

  // Run to completion (no animation, instant)
  simulation.tick(300);

  // Store results
  const result: Record<string, { x: number; y: number }> = {};
  const sizes: Record<string, { w: number; h: number }> = {};
  for (const node of nodes) {
    result[node.id] = { x: node.x ?? 0, y: node.y ?? 0 };
    sizes[node.id] = { w: node.w, h: node.h };
  }
  positions.value = result;
  nodeSizes.value = sizes;

  // Center the group in the viewport — exclude outlier cards like metrocard
  const centerNodes = nodes.filter((n) => n.id !== "metrocard" && n.id !== "passport");
  const xs = centerNodes.map((n) => (n.x ?? 0) - n.w / 2);
  const xe = centerNodes.map((n) => (n.x ?? 0) + n.w / 2);
  const ys = centerNodes.map((n) => (n.y ?? 0) - n.h / 2);
  const ye = centerNodes.map((n) => (n.y ?? 0) + n.h / 2);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xe);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ye);

  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;

  worldOriginX.value = 2000 + vw / 2 - cx;
  worldOriginY.value = 2000 + vh / 2 - cy;
  if (resetOffset) {
    // On mobile, pan right so about + project cards are visible first
    // (passport is seeded to the left and should start off-screen)
    offsetX.value = vw < 640 ? vw * -0.3 : 0;
    offsetY.value = 0;
  }
}

function pos(id: string) {
  const p = positions.value[id];
  const s = nodeSizes.value[id];
  const w = s?.w ?? CARD_W;
  const h = s?.h ?? CARD_H;
  return {
    position: "absolute" as const,
    left: `${worldOriginX.value + (p?.x ?? 0) - w / 2}px`,
    top: `${worldOriginY.value + (p?.y ?? 0) - h / 2}px`,
    width: `${w}px`,
    height: `${h}px`,
  };
}

// Drag
const isDragging = ref(false);
let startX = 0;
let startY = 0;
let lastOffsetX = 0;
let lastOffsetY = 0;

function onMouseDown(e: MouseEvent) {
  if (
    (e.target as HTMLElement).closest(
      ".world-card, .about-card, .np-card, .location-card, .theme-card, .lastfm-card, .toptrack-card, .social-card"
    )
  )
    return;
  isDragging.value = true;
  canvasRef.value?.classList.add("is-dragging");
  startX = e.clientX;
  startY = e.clientY;
  lastOffsetX = offsetX.value;
  lastOffsetY = offsetY.value;
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  offsetX.value = lastOffsetX + (e.clientX - startX);
  offsetY.value = lastOffsetY + (e.clientY - startY);
}

function onMouseUp() {
  isDragging.value = false;
  canvasRef.value?.classList.remove("is-dragging");
}

function onTouchStart(e: TouchEvent) {
  if (
    (e.target as HTMLElement).closest(
      ".world-card, .about-card, .np-card, .location-card, .theme-card, .lastfm-card, .toptrack-card, .social-card"
    )
  )
    return;
  const t = e.touches[0];
  isDragging.value = true;
  startX = t.clientX;
  startY = t.clientY;
  lastOffsetX = offsetX.value;
  lastOffsetY = offsetY.value;
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const t = e.touches[0];
  offsetX.value = lastOffsetX + (t.clientX - startX);
  offsetY.value = lastOffsetY + (t.clientY - startY);
}

function onTouchEnd() {
  isDragging.value = false;
}

// D-pad momentum
const MAX_SPEED = 12;
const ACCELERATION = 1.8;
const FRICTION = 0.88;

let velX = 0;
let velY = 0;
let dpadDirX = 0;
let dpadDirY = 0;
let rafId: number | null = null;

function dpadLoop() {
  if (dpadDirX !== 0) velX = clamp(velX + dpadDirX * ACCELERATION, -MAX_SPEED, MAX_SPEED);
  if (dpadDirY !== 0) velY = clamp(velY + dpadDirY * ACCELERATION, -MAX_SPEED, MAX_SPEED);

  velX *= FRICTION;
  velY *= FRICTION;

  if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
    offsetX.value = offsetX.value + velX;
    offsetY.value = offsetY.value + velY;
    rafId = requestAnimationFrame(dpadLoop);
  } else {
    velX = 0;
    velY = 0;
    rafId = null;
  }
}

function onDPadStart(dx: number, dy: number) {
  dpadDirX = dx;
  dpadDirY = dy;
  if (!rafId) rafId = requestAnimationFrame(dpadLoop);
}

function onDPadStop() {
  dpadDirX = 0;
  dpadDirY = 0;
  // let friction coast to a stop naturally
}

let resizeTimer: ReturnType<typeof setTimeout>;
let lastLayoutWidth = 0;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const vw = window.innerWidth;
    isMobile.value = vw < 640;
    // Only re-run layout when width changes — height-only changes are the
    // mobile address bar showing/hiding and shouldn't affect card positions.
    if (vw !== lastLayoutWidth) {
      lastLayoutWidth = vw;
      runLayout(vw, window.innerHeight, false);
    }
  }, 100);
}

onMounted(() => {
  isMobile.value = window.innerWidth < 640;
  lastLayoutWidth = window.innerWidth;
  updateTime();
  clockInterval = setInterval(updateTime, 60000);
  runLayout(window.innerWidth, window.innerHeight);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("touchend", onTouchEnd);
  window.removeEventListener("resize", onResize);
  clearTimeout(resizeTimer);
  clearInterval(clockInterval);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div ref="canvasRef" class="canvas" @mousedown="onMouseDown" @touchstart.passive="onTouchStart">
    <div
      class="world"
      :class="{ 'is-dragging': isDragging }"
      :style="{ transform: `translate(${offsetX}px, ${offsetY}px)` }"
    >
      <div class="grid-bg" />

      <WorldCard v-for="card in cards" :key="card.href" v-bind="card" :style="pos(card.href)" />

      <AboutCard :style="pos('about')" @click="aboutOpen = true" />
      <NowPlaying :style="pos('now-playing')" />
      <ThemeToggle :style="pos('theme-toggle')" />
      <LastFmCard :style="pos('lastfm')" />
      <LastFmTopTrack :style="pos('lastfm-track')" />
      <LastFmTopArtist :style="pos('lastfm-artist')" />
      <AceCard :style="pos('ace')" />
      <SocialCard
        :style="pos('linkedin')"
        href="https://www.linkedin.com/in/mustafa-s-mohamed/"
        label="LinkedIn"
        handle="mustafa-s-mohamed"
        icon="/icons/linkedin.svg"
        :rotate="1.5"
        accentColor="#0a66c2"
      />
      <SocialCard
        :style="pos('twitter')"
        href="https://twitter.com/ms7m"
        label="Twitter"
        handle="@ms7m"
        icon="/icons/twitter.svg"
        :rotate="-1.5"
        accentColor="#1d9bf0"
      />
      <MetroCard v-if="!isMobile" :style="pos('metrocard')" />
      <PassportCard :style="pos('passport')" @click="passportOpen = true" />
      <SnoopySticker :style="pos('snoopy')" />
      <SocialCard
        :style="pos('github')"
        href="https://github.com/ms7m"
        label="GitHub"
        handle="ms7m"
        icon="/icons/github.svg"
        :rotate="-2.5"
      />
    </div>

    <div v-if="!isMobile" class="dpad-wrapper">
      <DPad @start="onDPadStart" @stop="onDPadStop" />
    </div>

    <div class="logo">
      <span class="logo-time">Brooklyn, NY · {{ time }}</span>
      mikka
    </div>
  </div>

  <AboutModal v-model:open="aboutOpen" />
  <PassportSheet v-model:open="passportOpen" />
</template>

<style scoped>
.canvas {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: url("/cursors/Normal Select.cur"), grab;
  overscroll-behavior: none;
  touch-action: none;
}

.canvas.is-dragging {
  cursor: url("/cursors/Move.cur"), grabbing;
}

.world {
  position: absolute;
  width: 4000px;
  height: 4000px;
  top: -2000px;
  left: -2000px;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px);
  background-size: 96px 96px;
}

.dpad-wrapper {
  position: absolute;
  top: 32px;
  right: 32px;
}

.logo {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-family: "EditorialNew", Georgia, serif;
  font-size: 3rem;
  letter-spacing: -0.03em;
  pointer-events: none;
  user-select: none;
  color: hsl(var(--foreground));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.logo-time {
  font-family: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  color: hsl(var(--muted-foreground));
  line-height: 1;
}

@media (max-width: 639px) {
  .logo {
    font-size: 2rem;
    bottom: 16px;
    left: 16px;
  }
}
</style>
