<script setup lang="ts">
const emit = defineEmits<{
  start: [dx: number, dy: number];
  stop: [];
}>();

let holdInterval: ReturnType<typeof setInterval>;
let holdTimeout: ReturnType<typeof setTimeout>;

function startHold(dx: number, dy: number) {
  emit("start", dx, dy);
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => emit("start", dx, dy), 100);
  }, 300);
}

function stopHold() {
  clearTimeout(holdTimeout);
  clearInterval(holdInterval);
  emit("stop");
}
</script>

<template>
  <div class="dpad">
    <!-- Up -->
    <button
      class="dpad-btn dpad-up"
      @mousedown="startHold(0, 1)"
      @mouseup="stopHold"
      @mouseleave="stopHold"
      @touchstart.prevent="startHold(0, 1)"
      @touchend="stopHold"
      aria-label="Pan up"
    >
      <svg viewBox="0 0 10 10" fill="currentColor"><path d="M5 2 L8 7 L2 7 Z"/></svg>
    </button>

    <!-- Left -->
    <button
      class="dpad-btn dpad-left"
      @mousedown="startHold(1, 0)"
      @mouseup="stopHold"
      @mouseleave="stopHold"
      @touchstart.prevent="startHold(1, 0)"
      @touchend="stopHold"
      aria-label="Pan left"
    >
      <svg viewBox="0 0 10 10" fill="currentColor"><path d="M2 5 L7 2 L7 8 Z"/></svg>
    </button>

    <!-- Center nub -->
    <div class="dpad-center" />

    <!-- Right -->
    <button
      class="dpad-btn dpad-right"
      @mousedown="startHold(-1, 0)"
      @mouseup="stopHold"
      @mouseleave="stopHold"
      @touchstart.prevent="startHold(-1, 0)"
      @touchend="stopHold"
      aria-label="Pan right"
    >
      <svg viewBox="0 0 10 10" fill="currentColor"><path d="M8 5 L3 2 L3 8 Z"/></svg>
    </button>

    <!-- Down -->
    <button
      class="dpad-btn dpad-down"
      @mousedown="startHold(0, -1)"
      @mouseup="stopHold"
      @mouseleave="stopHold"
      @touchstart.prevent="startHold(0, -1)"
      @touchend="stopHold"
      aria-label="Pan down"
    >
      <svg viewBox="0 0 10 10" fill="currentColor"><path d="M5 8 L2 3 L8 3 Z"/></svg>
    </button>
  </div>
</template>

<style scoped>
.dpad {
  position: relative;
  width: 90px;
  height: 90px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 2px;
}

.dpad-btn {
  background: hsl(var(--background) / 0.8);
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("/cursors/Link Select.cur"), pointer;
  transition: background 0.1s, color 0.1s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 0;
}

.dpad-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--foreground));
}

.dpad-btn:active {
  background: hsl(var(--foreground));
  color: hsl(var(--background));
}

.dpad-btn svg {
  width: 10px;
  height: 10px;
}

.dpad-center {
  background: hsl(var(--background) / 0.8);
  border: 1px solid hsl(var(--border));
  backdrop-filter: blur(8px);
}

.dpad-up     { grid-column: 2; grid-row: 1; }
.dpad-left   { grid-column: 1; grid-row: 2; }
.dpad-center { grid-column: 2; grid-row: 2; }
.dpad-right  { grid-column: 3; grid-row: 2; }
.dpad-down   { grid-column: 2; grid-row: 3; }
</style>
