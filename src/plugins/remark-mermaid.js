import { visit } from "unist-util-visit";

/**
 * Converts ```mermaid fenced code blocks into Mermaid mount points.
 * This avoids conflicts with astro-expressive-code while preserving
 * the standard Markdown authoring experience.
 */
export function remarkMermaid() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (!parent || typeof index !== "number") return;
			if (node.lang?.toLowerCase() !== "mermaid") return;

			parent.children[index] = {
				type: "html",
				value: `<div class="mermaid-diagram" data-mermaid-source="${encodeURIComponent(node.value)}"></div>`,
			};
		});
	};
}
