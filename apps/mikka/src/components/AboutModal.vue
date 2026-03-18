<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const contentHtml = ref("");

async function loadContent() {
  if (contentHtml.value) return;
  try {
    const res = await fetch("/api/about");
    const data = await res.json();
    contentHtml.value = data.html ?? "";
  } catch {}
}

watch(() => props.open, (val) => { if (val) loadContent(); });

function close() {
  emit("update:open", false);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="close">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="close" @click="close" aria-label="Close">✕</button>
          <div class="modal-inner">
            <p class="modal-eyebrow">about</p>
            <div class="modal-content prose" v-html="contentHtml" />
          </div>
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
  background: hsl(var(--background) / 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url("/cursors/Normal Select.cur"), auto;
}

.modal {
  position: relative;
  width: min(480px, 90vw);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  padding: 48px;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  cursor: url("/cursors/Link Select.cur"), pointer;
  line-height: 1;
  padding: 4px;
  transition: color 0.15s;
}

.close:hover {
  color: hsl(var(--foreground));
}

.modal-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  margin-bottom: 20px;
}

/* Markdown prose styles */
.modal-content :deep(h1) {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 3rem;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 20px;
  font-weight: 400;
}

.modal-content :deep(h2) {
  font-family: "EditorialNew", Georgia, serif;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  margin: 24px 0 10px;
  font-weight: 400;
}

.modal-content :deep(p) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: hsl(var(--foreground) / 0.8);
  margin-bottom: 16px;
}

.modal-content :deep(hr) {
  border: none;
  border-top: 1px solid hsl(var(--border));
  margin: 24px 0;
}

.modal-content :deep(a) {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 1px;
  transition: color 0.15s, border-color 0.15s;
  cursor: url("/cursors/Link Select.cur"), pointer;
}

.modal-content :deep(a:hover) {
  color: hsl(var(--foreground));
  border-color: hsl(var(--foreground));
}

.modal-content :deep(ul), .modal-content :deep(ol) {
  padding-left: 1.2em;
  margin-bottom: 16px;
}

.modal-content :deep(li) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: hsl(var(--foreground) / 0.8);
}

/* Transitions */
.modal-enter-active {
  transition: opacity 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-leave-active .modal {
  animation: slide-down 0.2s ease forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slide-down {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(8px); }
}
</style>
