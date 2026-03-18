<script setup lang="ts">
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
} from "@floating-ui/vue";
import { ref, onMounted, onUnmounted } from "vue";
import { cn } from "../lib/utils";

const props = withDefaults(
  defineProps<{
    content: string;
    placement?: "top" | "bottom" | "left" | "right";
    class?: string;
  }>(),
  {
    placement: "top",
  }
);

const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const { floatingStyles, middlewareData, placement: resolvedPlacement } = useFloating(reference, floating, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
});

function open() { isOpen.value = true; }
function close() { isOpen.value = false; }
</script>

<template>
  <span
    ref="reference"
    class="relative cursor-help"
    @mouseenter="open"
    @mouseleave="close"
    @focus="open"
    @blur="close"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="floating"
        :style="floatingStyles"
        :class="cn(
          'z-50 max-w-xs rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-fade-in',
          props.class
        )"
      >
        {{ content }}
        <div
          ref="arrowRef"
          class="absolute h-2 w-2 rotate-45 bg-popover"
          :style="{
            left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
            top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
            bottom: resolvedPlacement === 'top' ? '-4px' : '',
          }"
        />
      </div>
    </Teleport>
  </span>
</template>
