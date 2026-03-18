<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const isDark = ref(false);

function syncTheme() {
  isDark.value = document.documentElement.classList.contains("dark");
}

const imageSrc = computed(() =>
  isDark.value ? "/images/flighty-dark.jpeg" : "/images/flighty-light.jpeg"
);

function close() {
  emit("update:open", false);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

let observer: MutationObserver;

onMounted(() => {
  syncTheme();
  observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("keydown", onKey);
});

onUnmounted(() => {
  observer?.disconnect();
  window.removeEventListener("keydown", onKey);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="overlay" @click.self="close">
        <div class="sheet" role="dialog" aria-modal="true">
          <button class="close" @click="close" aria-label="Close">✕</button>
          <img :src="imageSrc" alt="Flighty — travel record" class="flighty-img" draggable="false" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: hsl(var(--background) / 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("/cursors/Normal Select.cur"), auto;
}

.sheet {
  position: relative;
  max-width: 92vw;
  max-height: 88vh;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close {
  position: absolute;
  top: -12px;
  right: -12px;
  background: hsl(var(--background) / 0.8);
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: hsl(var(--muted-foreground));
  cursor: url("/cursors/Link Select.cur"), pointer;
  transition: color 0.15s, background 0.15s;
  z-index: 1;
  backdrop-filter: blur(4px);
}

.close:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.flighty-img {
  width: auto;
  height: auto;
  max-width: 92vw;
  max-height: 88vh;
  object-fit: contain;
  display: block;
  border-radius: 12px;
}

.sheet-enter-active {
  transition: opacity 0.3s ease;
}
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-active .sheet {
  animation: sheet-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.sheet-leave-active .sheet {
  animation: sheet-down 0.2s ease forwards;
}

@keyframes sheet-up {
  from { opacity: 0; transform: translateY(48px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes sheet-down {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(24px); }
}
</style>
