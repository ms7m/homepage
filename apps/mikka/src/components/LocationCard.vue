<script setup lang="ts">
const time = new Date().toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
</script>

<template>
  <div class="location-card" style="background-image: url('/images/brooklyn.jpg')">
    <div class="card-index">⌖</div>
    <div class="card-body">
      <p class="card-title">Brooklyn, NY</p>
    </div>
  </div>
</template>

<style scoped>
.location-card {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  border: 1px solid hsl(var(--border));
  background-size: cover;
  background-position: center;
  color: white;
  overflow: hidden;
  transform: rotate(1.5deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  cursor: url("/cursors/Normal Select.cur"), default;
  user-select: none;
  position: relative;
}

.location-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.card-index {
  writing-mode: vertical-rl;
  font-size: 1rem;
  color: rgba(255,255,255,0.7);
  padding: 10px 7px;
  border-right: 1px solid rgba(255,255,255,0.12);
  user-select: none;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  padding: 10px 10px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.card-title {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
  color: rgba(255,255,255,0.95);
  line-height: 1.2;
  margin: 0;
}

.card-sub {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.05em;
  margin: 2px 0 0;
}
</style>
