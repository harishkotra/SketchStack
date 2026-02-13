/**
 * @fileoverview Builds Excalidraw JSON from a diagram plan.
 */

import config from '../../config.js';
import { computeLayout } from './layoutEngine.js';

const { nodeWidth, nodeHeight, layerGap, startX, startY } = config.layout;

/**
 * Generate a random ID for Excalidraw elements.
 * @returns {string}
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Get style configuration for a node type.
 * @param {string} type
 * @returns {object} { backgroundColor, strokeColor, strokeStyle }
 */
function getStyle(type) {
    const styles = {
        gateway: { bg: '#eef2ff', stroke: '#6366f1', shape: 'rectangle' }, // Indigo
        service: { bg: '#ffffff', stroke: '#64748b', shape: 'rectangle' }, // Slate
        database: { bg: '#f0fdf4', stroke: '#22c55e', shape: 'ellipse' }, // Green
        queue: { bg: '#fef3c7', stroke: '#f59e0b', shape: 'rectangle' }, // Amber
        cache: { bg: '#fff7ed', stroke: '#ea580c', shape: 'ellipse' }, // Orange
        storage: { bg: '#eff6ff', stroke: '#3b82f6', shape: 'rectangle' }, // Blue
        other: { bg: '#f8fafc', stroke: '#94a3b8', shape: 'rectangle' }, // Gray
    };
    return styles[type.toLowerCase()] || styles.other;
}

/**
 * Build Excalidraw JSON from diagram plan.
 * @param {object} diagramPlan { nodes, edges }
 * @returns {object} Excalidraw scene object
 */
export function buildExcalidrawJson(diagramPlan) {
    const elements = [];
    const nodeMap = new Map(); // Map internal ID to Excalidraw Element ID

    // 1. Compute Layout
    // layoutEngine expects nodes with { id, type, ... } AND edges for dependency graph
    const positionedNodes = computeLayout(diagramPlan.nodes, diagramPlan.edges);

    // 2. Create Nodes
    positionedNodes.forEach((node) => {
        const style = getStyle(node.type);
        const elementId = generateId();
        const textId = generateId();
        nodeMap.set(node.id, elementId);

        // Use computed coordinates
        const x = node.x;
        const y = node.y;

        // Shape
        const shape = {
            id: elementId,
            type: style.shape === 'ellipse' ? 'ellipse' : 'rectangle',
            x,
            y,
            width: nodeWidth,
            height: nodeHeight,
            angle: 0,
            strokeColor: style.stroke,
            backgroundColor: style.bg,
            fillStyle: 'solid',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            roundness: { type: 3 },
            seed: Math.floor(Math.random() * 100000),
            version: 1,
            versionNonce: 0,
            isDeleted: false,
            boundElements: [{ id: textId, type: 'text' }],
            updated: Date.now(),
        };

        // Label
        const label = {
            id: textId,
            type: 'text',
            x: x + 10,
            y: y + 20, // Approximate centering - Excalidraw handles this better if we could use their API, but for JSON this is okay
            width: nodeWidth - 20,
            height: 20,
            angle: 0,
            strokeColor: '#1e293b',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            text: node.label,
            fontSize: 16,
            fontFamily: 1,
            textAlign: 'center',
            verticalAlign: 'middle',
            containerId: elementId,
            originalText: node.label,
            seed: Math.floor(Math.random() * 100000),
            version: 1,
            versionNonce: 0,
            isDeleted: false,
            updated: Date.now(),
        };

        elements.push(shape, label);
    });

    // 3. Create Edges
    diagramPlan.edges.forEach((edge) => {
        const fromId = nodeMap.get(edge.from);
        const toId = nodeMap.get(edge.to);

        if (fromId && toId) {
            // Find positions
            const fromEl = elements.find(e => e.id === fromId);
            const toEl = elements.find(e => e.id === toId);

            if (!fromEl || !toEl) return;

            const arrowId = generateId();

            // Simple center-to-center logic for now, or edge-to-edge
            const startX = fromEl.x + fromEl.width / 2;
            const startY = fromEl.y + fromEl.height / 2;
            const endX = toEl.x + toEl.width / 2;
            const endY = toEl.y + toEl.height / 2;

            const arrow = {
                id: arrowId,
                type: 'arrow',
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY,
                angle: 0,
                strokeColor: '#64748b',
                backgroundColor: 'transparent',
                fillStyle: 'solid',
                strokeWidth: 2,
                strokeStyle: 'solid',
                roughness: 1,
                opacity: 100,
                groupIds: [],
                points: [
                    [0, 0],
                    [endX - startX, endY - startY]
                ],
                startBinding: { elementId: fromId, focus: 0.1, gap: 1 },
                endBinding: { elementId: toId, focus: 0.1, gap: 1 },
                seed: Math.floor(Math.random() * 100000),
                version: 1,
                versionNonce: 0,
                isDeleted: false,
                updated: Date.now(),
                endArrowhead: 'arrow',
            };

            elements.push(arrow);

            // Edge Label
            if (edge.label) {
                const textId = generateId();
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const text = {
                    id: textId,
                    type: 'text',
                    x: midX,
                    y: midY,
                    width: 100,
                    height: 20,
                    angle: 0,
                    strokeColor: '#475569',
                    backgroundColor: '#ffffff',
                    fillStyle: 'solid',
                    strokeWidth: 1,
                    strokeStyle: 'solid',
                    roughness: 1,
                    opacity: 100,
                    groupIds: [],
                    text: edge.label,
                    fontSize: 12,
                    fontFamily: 1,
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    seed: Math.floor(Math.random() * 100000),
                    version: 1,
                    versionNonce: 0,
                    isDeleted: false,
                    updated: Date.now(),
                };
                elements.push(text);
            }
        }
    });

    return {
        type: 'excalidraw',
        version: 2,
        source: 'https://excalidraw.com',
        elements,
        appState: {
            viewBackgroundColor: '#ffffff',
            gridSize: 20,
        }
    };
}
