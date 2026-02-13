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

import dagre from 'dagre';

/**
 * Compute positions for all nodes using dagre for directed graph layout.
 * @param {Array<{id:string, label:string, type:string, layer?:string}>} nodes
 * @param {Array<{from:string, to:string}>} edges
 * @returns {Array<{id:string, label:string, type:string, layer:string, x:number, y:number}>}
 */
export function computeLayout(nodes, edges = []) {
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();

    // Set an object for the graph label
    g.setGraph({
        rankdir: 'LR',
        align: 'UL',
        nodesep: horizontalSpacing,
        ranksep: layerGap,
        marginx: startX,
        marginy: startY
    });

    // Default to assigning a new object for the edge label
    g.setDefaultEdgeLabel(function () { return {}; });

    // Add nodes to the graph. The first argument is the node id. The second is
    // metadata about the node. In this case we're going to add labels to each of
    // our nodes.
    nodes.forEach((node) => {
        g.setNode(node.id, {
            label: node.label,
            width: nodeWidth,
            height: nodeHeight,
            // Keep original data
            original: node
        });
    });

    // Add edges to the graph.
    edges.forEach((edge) => {
        g.setEdge(edge.from, edge.to);
    });

    // Compute the layout
    dagre.layout(g);

    // Extract positioned nodes
    const positioned = [];
    g.nodes().forEach((v) => {
        const node = g.node(v);
        // node.x and node.y are the center of the node in dagre
        // Our renderer expects top-left (usually), but let's check excalidrawBuilder.
        // excalidrawBuilder uses x, y directly for shape.x/y.
        // Excalidraw rectangles are positioned by top-left.
        // Dagre gives center. So we need to subtract half width/height.
        positioned.push({
            ...node.original,
            x: node.x - nodeWidth / 2,
            y: node.y - nodeHeight / 2,
        });
    });

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
