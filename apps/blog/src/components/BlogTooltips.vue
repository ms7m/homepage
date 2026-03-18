<script setup lang="ts">
/**
 * BlogTooltips — mounts once per blog post page.
 * Queries all .ai-diff and .ctx-tooltip spans and attaches
 * floating tooltip behavior using @floating-ui/vue.
 *
 * Uses a single shared tooltip element positioned via Floating UI.
 */
import { onMounted, onUnmounted, ref } from "vue";
import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/dom";

const tooltipEl = ref<HTMLDivElement | null>(null);
const tooltipText = ref("");
const isVisible = ref(false);

let activeCleanup: (() => void) | null = null;

function showTooltip(anchor: HTMLElement, text: string) {
  if (!tooltipEl.value) return;
  tooltipText.value = text;
  isVisible.value = true;

  activeCleanup = autoUpdate(anchor, tooltipEl.value, () => {
    if (!tooltipEl.value) return;
    computePosition(anchor, tooltipEl.value, {
      placement: "top",
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      if (!tooltipEl.value) return;
      Object.assign(tooltipEl.value.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  });
}

function hideTooltip() {
  isVisible.value = false;
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

onMounted(() => {
  const aiDiffs = document.querySelectorAll<HTMLElement>(".ai-diff");
  const ctxTooltips = document.querySelectorAll<HTMLElement>(".ctx-tooltip");

  function attachTooltip(el: HTMLElement, attr: string, prefix: string) {
    const text = el.getAttribute(attr);
    if (!text) return;

    const label = prefix + text;

    el.addEventListener("mouseenter", () => showTooltip(el, label));
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus", () => showTooltip(el, label));
    el.addEventListener("blur", hideTooltip);
  }

  aiDiffs.forEach((el) => attachTooltip(el, "data-original", "AI changed from: "));
  ctxTooltips.forEach((el) => attachTooltip(el, "data-ctx", ""));
});

onUnmounted(() => {
  if (activeCleanup) activeCleanup();
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="tooltipEl"
      role="tooltip"
      :class="[
        'fixed z-50 max-w-xs rounded-md bg-popover border border-border px-3 py-2 text-sm text-popover-foreground shadow-md pointer-events-none transition-opacity duration-150',
        isVisible ? 'opacity-100' : 'opacity-0',
      ]"
      :style="{ position: 'absolute' }"
    >
      {{ tooltipText }}
    </div>
  </Teleport>
</template>
