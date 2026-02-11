/**
 * @fileoverview Layout engine — computes x/y positions for diagram nodes.
 * Groups by layer, positions left-to-right within each layer.
 */

import config from '../../config.js';

const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing, layerGap, startX, startY } = config.layout;
const LAYER_ORDER = config.layers;

/**
 * Determine which layer a component type belongs to.
 * @param {string} type - Component type (e.g. frontend, database, monitoring)
 * @returns {string} Layer name
 */
export function assignLayer(type) {
    const mapping = {
        // Security layer
        auth: 'Security',
        waf: 'Security',
        secret_manager: 'Security',

        // Application layer
        frontend: 'Application',
        backend: 'Application',
        api_gateway: 'Application',
        load_balancer: 'Application',
        serverless_function: 'Application',
        container: 'Application',
        proxy: 'Application',
        service_mesh: 'Application',
        ml_model: 'Application',
        scheduler: 'Application',

        // Data layer
        database: 'Data',
        cache: 'Data',
        queue: 'Data',
        vector_db: 'Data',
        search: 'Data',
        stream_processor: 'Data',

        // Infra layer
        storage: 'Infra',
        cdn: 'Infra',
        dns: 'Infra',

        // Observability layer
        monitoring: 'Observability',
        logging: 'Observability',
        notification: 'Observability',
    };

    return mapping[type] || 'Application';
}

/**
 * Compute positions for all nodes, grouping by layer and positioning left-to-right.
 * @param {Array<{id:string, label:string, type:string, layer?:string}>} nodes
 * @returns {Array<{id:string, label:string, type:string, layer:string, x:number, y:number}>}
 */
export function computeLayout(nodes) {
    // Assign layers
    const withLayers = nodes.map((n) => ({
        ...n,
        layer: n.layer || assignLayer(n.type),
    }));

    // Group by layer
    const layerGroups = {};
    for (const layer of LAYER_ORDER) {
        layerGroups[layer] = [];
    }
    for (const node of withLayers) {
        if (!layerGroups[node.layer]) {
            layerGroups[node.layer] = [];
        }
        layerGroups[node.layer].push(node);
    }

    // Position nodes
    const positioned = [];
    let currentY = startY;

    for (const layer of LAYER_ORDER) {
        const group = layerGroups[layer];
        if (group.length === 0) continue;

        let currentX = startX;
        for (const node of group) {
            positioned.push({
                ...node,
                x: currentX,
                y: currentY,
            });
            currentX += nodeWidth + horizontalSpacing;
        }

        currentY += nodeHeight + layerGap;
    }

    return positioned;
}

/**
 * Get unique layer names that have nodes assigned.
 * @param {Array<{layer:string}>} nodes
 * @returns {string[]}
 */
export function getActiveLayers(nodes) {
    const active = new Set(nodes.map((n) => n.layer));
    return LAYER_ORDER.filter((l) => active.has(l));
}

export { LAYER_ORDER };
