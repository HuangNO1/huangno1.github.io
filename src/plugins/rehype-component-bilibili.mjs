/// <reference types="mdast" />
import { h } from "hastscript";

function normalizePage(page) {
	const pageNumber = Number.parseInt(`${page ?? 1}`, 10);
	return Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
}

/**
 * Creates a Bilibili embed component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.bvid - The Bilibili BV id.
 * @param {string} [properties.title] - The iframe title and caption.
 * @param {string|number} [properties.page] - The video page number.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created Bilibili embed component.
 */
export function BilibiliComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid directive. ("bilibili" directive must be leaf type "::bilibili{bvid="BVxxxxxxxxxx"}")',
		);

	const bvid = properties?.bvid?.trim();
	if (!bvid || !/^BV[0-9A-Za-z]+$/.test(bvid))
		return h(
			"div",
			{ class: "hidden" },
			'Invalid Bilibili video id. ("bvid" attribute must look like "BV1YR4y1q7tX")',
		);

	const page = normalizePage(properties?.page);
	const title = properties?.title?.trim() || `Bilibili video ${bvid}`;
	const videoUrl = `https://www.bilibili.com/video/${bvid}/`;
	const playerUrl = `https://player.bilibili.com/player.html?isOutside=true&bvid=${encodeURIComponent(bvid)}&p=${page}`;

	return h("figure", { class: "bilibili-embed" }, [
		h("div", { class: "bilibili-embed-frame" }, [
			h("iframe", {
				src: playerUrl,
				title,
				loading: "lazy",
				scrolling: "no",
				border: "0",
				frameborder: "no",
				framespacing: "0",
				allowfullscreen: "true",
				referrerpolicy: "strict-origin-when-cross-origin",
			}),
		]),
		h("figcaption", { class: "bilibili-embed-caption" }, [
			h("a", { href: videoUrl, target: "_blank", rel: "noopener noreferrer" }, title),
		]),
	]);
}
