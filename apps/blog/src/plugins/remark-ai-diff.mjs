import { visit } from "unist-util-visit";

/**
 * Remark plugin that transforms AI diff markers in markdown text.
 *
 * Syntax: {current text|~original text~}
 * Example: The cat sat on the {mat|~rug~} today.
 *
 * Renders as a <span> with the current text visible and original
 * stored in data-original for hover tooltip display.
 */

const DIFF_PATTERN = /\{([^|{}]+)\|~([^~{}]+)~\}/g;

export function remarkAiDiff() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!DIFF_PATTERN.test(node.value)) return;
      DIFF_PATTERN.lastIndex = 0;

      const nodes = [];
      let last = 0;
      let match;

      while ((match = DIFF_PATTERN.exec(node.value)) !== null) {
        if (match.index > last) {
          nodes.push({ type: "text", value: node.value.slice(last, match.index) });
        }

        const [, current, original] = match;
        const escaped = original.replace(/"/g, "&quot;").replace(/</g, "&lt;");

        nodes.push({
          type: "html",
          value: `<span class="ai-diff" data-original="${escaped}" tabindex="0" role="mark" aria-label="AI changed from: ${escaped}">${current}</span>`,
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
