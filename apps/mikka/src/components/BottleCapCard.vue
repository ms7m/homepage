<template>
  <div class="bottlecap-card">
    <img src="/images/bottlecap.png" alt="Coca-Cola bottle cap" draggable="false" />
  </div>
</template>

<style scoped>
.bottlecap-card {
  width: 100%;
  height: 100%;
  transform: rotate(23deg);
  transition: transform 0.2s ease;
  cursor: url("/cursors/Normal Select.cur"), default;
}

.bottlecap-card:hover {
  transform: rotate(23deg) scale(1.05);
}

.bottlecap-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
