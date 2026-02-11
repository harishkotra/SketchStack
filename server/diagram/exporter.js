/**
 * @fileoverview Export utilities — XML download, draw.io URL generation, etc.
 */

import pako from 'pako';

/**
 * Compress XML and generate a draw.io editor URL.
 * Uses the same scheme as the official draw.io MCP server.
 * @param {string} xml - mxGraph XML content
 * @param {object} [opts]
 * @param {boolean} [opts.lightbox=false]
 * @param {string} [opts.dark='auto']
 * @returns {string} draw.io URL
 */
export function generateDrawioUrl(xml, opts = {}) {
    const compressed = pako.deflateRaw(new TextEncoder().encode(xml));
    const base64 = Buffer.from(compressed).toString('base64');
    const encoded = encodeURIComponent(base64);

    const params = new URLSearchParams();
    if (opts.lightbox) params.set('lightbox', '1');
    if (opts.dark && opts.dark !== 'auto') params.set('dark', opts.dark);

    const paramStr = params.toString() ? `?${params.toString()}` : '';
    return `https://app.diagrams.net/${paramStr}#R${encoded}`;
}

/**
 * Generate a draw.io viewer URL for embedding.
 * @param {string} xml
 * @returns {string}
 */
export function generateViewerUrl(xml) {
    const compressed = pako.deflateRaw(new TextEncoder().encode(xml));
    const base64 = Buffer.from(compressed).toString('base64');
    const encoded = encodeURIComponent(base64);
    return `https://viewer.diagrams.net/?highlight=0000ff&edit=_blank&layers=1&nav=1#R${encoded}`;
}

/**
 * Return raw XML string suitable for .drawio file download.
 * @param {string} xml
 * @returns {string}
 */
export function exportAsDrawioXml(xml) {
    return xml;
}

/**
 * Generate an SVG export. Since we don't have headless draw.io,
 * we generate a basic SVG representation for download.
 * Users can also use the draw.io editor to export SVG/PNG/PDF.
 * @param {string} xml
 * @returns {string} SVG markup
 */
export function generateSvgFallback(xml) {
    // Return a simple SVG wrapper that embeds the draw.io viewer
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg1.1.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="600">
  <text x="20" y="40" font-family="Arial" font-size="14" fill="#333">
    Architecture Diagram — Open the .drawio file in draw.io for full rendering.
  </text>
  <text x="20" y="70" font-family="Arial" font-size="11" fill="#666">
    Export to SVG/PNG/PDF from draw.io: File → Export As → SVG/PNG/PDF
  </text>
</svg>`;
}
