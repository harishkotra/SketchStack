/**
 * @fileoverview Builds mxGraph XML from a diagram plan (nodes + edges).
 */

import { getIconStyle } from './cloudIcons.js';
import { computeLayout, getActiveLayers, assignLayer } from './layoutEngine.js';
import config from '../../config.js';

const { nodeWidth, nodeHeight, layerGap, startX, startY } = config.layout;

/**
 * Escape XML special characters.
 * @param {string} str
 * @returns {string}
 */
function escXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Build a complete mxGraph XML document from a diagram plan.
 * @param {object} diagramPlan - { nodes: [...], edges: [...] }
 * @param {string} [cloudProvider='neutral']
 * @param {string} [title='Architecture Diagram']
 * @returns {string} mxGraph XML
 */
export function buildMxGraphXml(diagramPlan, cloudProvider = 'neutral', title = 'Architecture Diagram') {
    const { nodes, edges } = diagramPlan;

    // Compute layout positions
    const positionedNodes = computeLayout(nodes);
    const activeLayers = getActiveLayers(positionedNodes);

    // Build cell ID counters
    let cellId = 2; // 0 = root, 1 = default parent
    const nodeIdMap = {}; // component id → mxCell id
    const layerIdMap = {}; // layer name → mxCell id (parent group)

    const cells = [];

    // --- Create layer groups ---
    for (const layer of activeLayers) {
        const lid = cellId++;
        layerIdMap[layer] = lid;

        // Compute bounding box for the layer
        const layerNodes = positionedNodes.filter((n) => n.layer === layer);
        const minX = Math.min(...layerNodes.map((n) => n.x)) - 20;
        const minY = Math.min(...layerNodes.map((n) => n.y)) - 30;
        const maxX = Math.max(...layerNodes.map((n) => n.x + nodeWidth)) + 20;
        const maxY = Math.max(...layerNodes.map((n) => n.y + nodeHeight)) + 20;

        cells.push(
            `    <mxCell id="${lid}" value="${escXml(layer)} Layer" ` +
            `style="swimlane;startSize=25;fillColor=#f8fafc;strokeColor=#e2e8f0;fontColor=#64748b;fontStyle=1;fontSize=12;rounded=1;shadow=0;opacity=100;spacingLeft=10;" ` +
            `vertex="1" parent="1">` +
            `\n      <mxGeometry x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" as="geometry"/>` +
            `\n    </mxCell>`
        );
    }

    // --- Create nodes ---
    for (const node of positionedNodes) {
        const nid = cellId++;
        nodeIdMap[node.id] = nid;

        // Add refined node styling overrides
        // We append to the base icon style
        let style = getIconStyle(node.type, cloudProvider);

        // If it's a standard box (not a cloud shape), ensure it looks crisp
        if (!style.includes('shape=mxgraph.')) {
            style += 'fillColor=#ffffff;strokeColor=#94a3b8;strokeWidth=1.5;fontColor=#0f172a;shadow=1;';
        } else {
            // For cloud icons, just ensure text is dark
            style += 'fontColor=#0f172a;';
        }

        const parentId = layerIdMap[node.layer] || 1;

        // Adjust coordinates relative to parent group
        const parentNodes = positionedNodes.filter((n) => n.layer === node.layer);
        const parentMinX = Math.min(...parentNodes.map((n) => n.x)) - 20;
        const parentMinY = Math.min(...parentNodes.map((n) => n.y)) - 30;
        const relX = node.x - parentMinX;
        const relY = node.y - parentMinY;

        const isCloudShape = cloudProvider !== 'neutral' && style.includes('shape=mxgraph.');
        const w = isCloudShape ? 60 : nodeWidth;
        const h = isCloudShape ? 60 : nodeHeight;

        cells.push(
            `    <mxCell id="${nid}" value="${escXml(node.label)}" ` +
            `style="${style}whiteSpace=wrap;html=1;fontSize=11;fontFamily=Helvetica;" ` +
            `vertex="1" parent="${parentId}">` +
            `\n      <mxGeometry x="${relX}" y="${relY}" width="${w}" height="${h}" as="geometry"/>` +
            `\n    </mxCell>`
        );

        // For cloud shapes, add a label below
        if (isCloudShape) {
            const labelId = cellId++;
            cells.push(
                `    <mxCell id="${labelId}" value="${escXml(node.label)}" ` +
                `style="text;html=1;align=center;verticalAlign=top;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=10;fontColor=#475569;" ` +
                `vertex="1" parent="${parentId}">` +
                `\n      <mxGeometry x="${relX - 10}" y="${relY + h + 2}" width="${w + 20}" height="${20}" as="geometry"/>` +
                `\n    </mxCell>`
            );
        }
    }

    // --- Create edges ---
    for (const edge of edges) {
        const eid = cellId++;
        const sourceId = nodeIdMap[edge.from];
        const targetId = nodeIdMap[edge.to];

        if (!sourceId || !targetId) continue; // skip broken edges

        const label = edge.label ? escXml(edge.label) : '';
        const protocolLabel = edge.protocol ? ` [${escXml(edge.protocol)}]` : '';
        const fullLabel = `${label}${protocolLabel}`.trim();

        // Determine relative position for better routing
        const sourceNode = positionedNodes.find((n) => n.id === edge.from);
        const targetNode = positionedNodes.find((n) => n.id === edge.to);

        let edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;curved=1;strokeWidth=2;fontSize=10;fontColor=#475569;strokeColor=#64748b;labelBackgroundColor=#f8fafc;';

        if (sourceNode && targetNode) {
            if (sourceNode.layer === targetNode.layer) {
                // Same layer
                const isAdjacent = Math.abs(sourceNode.x - targetNode.x) < (nodeWidth + config.layout.horizontalSpacing * 1.5);

                if (isAdjacent) {
                    // Adjacent: Direct Side-to-Side
                    if (sourceNode.x < targetNode.x) {
                        edgeStyle += 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;';
                    } else {
                        edgeStyle += 'exitX=0;exitY=0.5;entryX=1;entryY=0.5;';
                    }
                } else {
                    // Non-adjacent (long jump): Route via Top or Bottom to avoid cutting through
                    // Flip logic: if going Right, loop Bottom. If going Left, loop Top.
                    if (sourceNode.x < targetNode.x) {
                        edgeStyle += 'exitX=0.5;exitY=1;entryX=0.5;entryY=1;'; // Bottom loop
                    } else {
                        edgeStyle += 'exitX=0.5;exitY=0;entryX=0.5;entryY=0;'; // Top loop
                    }
                }
            } else {
                // Different layer: Vertical
                if (sourceNode.y < targetNode.y) {
                    edgeStyle += 'exitX=0.5;exitY=1;entryX=0.5;entryY=0;';
                } else {
                    edgeStyle += 'exitX=0.5;exitY=0;entryX=0.5;entryY=1;';
                }
            }
        }

        cells.push(
            `    <mxCell id="${eid}" value="${fullLabel}" ` +
            `style="${edgeStyle}" ` +
            `edge="1" parent="1" source="${sourceId}" target="${targetId}">` +
            `\n      <mxGeometry relative="1" as="geometry"/>` +
            `\n    </mxCell>`
        );
    }

    // --- Assemble full XML ---
    return `<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="1">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
${cells.join('\n')}
  </root>
</mxGraphModel>`;
}
