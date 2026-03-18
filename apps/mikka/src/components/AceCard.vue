<script setup lang="ts">
</script>

<template>
  <div class="ace-card world-card">
    <!-- Top left -->
    <div class="corner corner-tl">
      <span class="rank">A</span>
      <span class="suit">♠</span>
    </div>

    <!-- Center spade -->
    <div class="center-suit">♠</div>

    <!-- Bottom right (rotated) -->
    <div class="corner corner-br">
      <span class="rank">A</span>
      <span class="suit">♠</span>
    </div>
  </div>
</template>

<style scoped>
.ace-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
  position: relative;
  transform: rotate(3deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Normal Select.cur"), default;
  user-select: none;
}

.ace-card:hover {
  transform: rotate(0deg);
  box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08);
}

.corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}

.corner-tl {
  top: 10px;
  left: 12px;
}

.corner-br {
  bottom: 10px;
  right: 12px;
  transform: rotate(180deg);
}

.rank {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
}

.corner .suit {
  font-size: 0.7rem;
  line-height: 1;
}

.center-suit {
  font-size: 5rem;
  line-height: 1;
  /* optical center — spade glyph sits a touch high */
  margin-top: 0.1em;
}
</style>
