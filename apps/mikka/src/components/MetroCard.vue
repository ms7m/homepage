<template>
  <div class="metrocard world-card">
    <img src="/images/metrocard.png" alt="MetroCard" />
  </div>
</template>

<style scoped>
.metrocard {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: rotate(-22deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: url("/cursors/Normal Select.cur"), default;
}

.metrocard:hover {
  transform: rotate(-22deg) scale(1.03);
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}

.metrocard img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
