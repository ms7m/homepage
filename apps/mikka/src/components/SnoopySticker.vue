<template>
  <div class="snoopy">
    <img src="/images/sticker/snoopy-sticker.gif" alt="Snoopy sticker" draggable="false" />
  </div>
</template>

<style scoped>
.snoopy {
  width: 100%;
  height: 100%;
  transform: rotate(-6deg);
  transition: transform 0.2s ease;
  cursor: url("/cursors/Normal Select.cur"), default;
}

.snoopy:hover {
  transform: rotate(-3deg) scale(1.05);
}

.snoopy img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
