<template>
  <div class="keys-card">
    <img src="/images/keys.png" alt="Keys" draggable="false" />
  </div>
</template>

<style scoped>
.keys-card {
  width: 100%;
  height: 100%;
  cursor: url("/cursors/Normal Select.cur"), default;
}

.keys-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
