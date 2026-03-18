import { visit } from "unist-util-visit";

/**
 * Remark plugin that transforms context tooltip markers in markdown text.
 *
 * Syntax: {?tooltip content}wrapped text{/?}
 * Example: The {?This refers to Claude 3.5 Sonnet}Anthropic model{/?} was released.
 *
 * For inline single-word tooltips: word{?tooltip text}
 * Example: The model{?Claude 3.5 Sonnet, released 2024} performed well.
 */

const INLINE_PATTERN = /(\S+)\{\?([^}]+)\}/g;

export function remarkContextTooltip() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!INLINE_PATTERN.test(node.value)) return;
      INLINE_PATTERN.lastIndex = 0;

      const nodes = [];
      let last = 0;
      let match;

      while ((match = INLINE_PATTERN.exec(node.value)) !== null) {
        if (match.index > last) {
          nodes.push({ type: "text", value: node.value.slice(last, match.index) });
        }

        const [, word, tooltip] = match;
        const escaped = tooltip.replace(/"/g, "&quot;").replace(/</g, "&lt;");

        nodes.push({
          type: "html",
          value: `<span class="ctx-tooltip" data-ctx="${escaped}" tabindex="0" role="note" aria-label="Context: ${escaped}">${word}</span>`,
        });

        last = match.index + match[0].length;
      }

      if (last < node.value.length) {
        nodes.push({ type: "text", value: node.value.slice(last) });
      }

      if (nodes.length > 1) {
        parent.children.splice(index, 1, ...nodes);
      }
    });
  };
}
