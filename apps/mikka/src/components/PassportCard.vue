<script setup lang="ts">
defineEmits<{ click: [] }>();
</script>

<template>
  <div class="passport-card world-card" @click="$emit('click')">
    <img src="/images/passport.svg" alt="Passport" class="passport-img" draggable="false" />
  </div>
</template>

<style scoped>
.passport-card {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: rotate(348deg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Link Select.cur"), pointer;
  border-radius: 6px;
}

.passport-card:hover {
  transform: rotate(360deg) scale(1.03);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.24);
}

.passport-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
