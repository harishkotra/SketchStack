/**
 * @fileoverview Architecture Agent — orchestrates the full pipeline:
 *   1. Extract requirements from natural language
 *   2. Detect architecture style
 *   3. Generate diagram plan (nodes + edges)
 *   4. Refine existing diagram based on user instructions
 */

import { chat, extractJson } from '../ollama/client.js';
import { buildExtractionPrompt, buildExtractionUserMessage } from '../prompts/extraction.js';
import { buildRefinementPrompt, buildRefinementUserMessage } from '../prompts/refinement.js';
import { ArchitecturePlanSchema, DiagramPlanSchema } from '../parsers/schemas.js';
import { validateAndRetry } from '../parsers/validator.js';
import { assignLayer } from '../diagram/layoutEngine.js';
import { getTypeEmoji } from '../diagram/cloudIcons.js';

/**
 * Step 1 — Extract architectural requirements from user prompt.
 * @param {string} description - Natural language architecture description
 * @param {string} [cloudProvider='neutral']
 * @param {string} [model]
 * @returns {Promise<object>} Validated architecture plan
 */
export async function extractRequirements(description, cloudProvider = 'neutral', model) {
    console.log('[agent] Step 1: Extracting requirements...');

    const messages = [
        { role: 'system', content: buildExtractionPrompt(cloudProvider) },
        { role: 'user', content: buildExtractionUserMessage(description) },
    ];

    const rawResponse = await chat(messages, { model });
    const plan = await validateAndRetry(rawResponse, ArchitecturePlanSchema, { model });

    console.log(`[agent] Extracted ${plan.components.length} components, ${plan.relationships.length} relationships`);
    return plan;
}

/**
 * Step 2 — Detect or override architecture style.
 * @param {object} plan - Architecture plan
 * @param {string} [styleOverride] - User-selected style override
 * @returns {object} Plan with confirmed architecture_style
 */
export function detectArchitectureStyle(plan, styleOverride) {
    if (styleOverride) {
        console.log(`[agent] Step 2: Style overridden to "${styleOverride}"`);
        return { ...plan, architecture_style: styleOverride };
    }

    console.log(`[agent] Step 2: Detected style "${plan.architecture_style}"`);
    return plan;
}

/**
 * Step 3 — Convert architecture plan into diagram plan (nodes + edges).
 * @param {object} plan - Architecture plan
 * @param {string} [cloudProvider='neutral']
 * @returns {object} Diagram plan with nodes and edges
 */
export function generateDiagramPlan(plan, cloudProvider = 'neutral') {
    console.log('[agent] Step 3: Generating diagram plan...');

    const nodes = plan.components.map((comp) => ({
        id: comp.id,
        label: comp.name,
        type: comp.type,
        cloud_icon: '',
        layer: assignLayer(comp.type),
    }));

    const edges = plan.relationships.map((rel) => ({
        from: rel.from,
        to: rel.to,
        label: rel.label || '',
        protocol: rel.protocol || '',
    }));

    const diagramPlan = { nodes, edges };

    console.log(`[agent] Diagram plan: ${nodes.length} nodes, ${edges.length} edges`);
    return diagramPlan;
}

/**
 * Iteration mode — Refine an existing architecture plan based on user instruction.
 * @param {object} existingPlan - Current architecture plan JSON
 * @param {string} instruction - User refinement instruction
 * @param {string} [cloudProvider='neutral']
 * @param {string} [model]
 * @returns {Promise<object>} Updated architecture plan
 */
export async function refinePlan(existingPlan, instruction, cloudProvider = 'neutral', model) {
    console.log('[agent] Refining architecture plan...');

    const messages = [
        { role: 'system', content: buildRefinementPrompt() },
        { role: 'user', content: buildRefinementUserMessage(existingPlan, instruction) },
    ];

    const rawResponse = await chat(messages, { model });
    const updatedPlan = await validateAndRetry(rawResponse, ArchitecturePlanSchema, { model });

    console.log(`[agent] Refined: ${updatedPlan.components.length} components, ${updatedPlan.relationships.length} relationships`);
    return updatedPlan;
}

/**
 * Full pipeline — from natural language to diagram plan.
 * @param {object} opts
 * @param {string} opts.description
 * @param {string} [opts.cloudProvider='neutral']
 * @param {string} [opts.architectureStyle]
 * @param {string} [opts.model]
 * @returns {Promise<{architecturePlan: object, diagramPlan: object}>}
 */
export async function runPipeline(opts) {
    const { description, cloudProvider = 'neutral', architectureStyle, model } = opts;

    // Step 1
    const rawPlan = await extractRequirements(description, cloudProvider, model);

    // Step 2
    const styledPlan = detectArchitectureStyle(rawPlan, architectureStyle);

    // Step 3
    const diagramPlan = generateDiagramPlan(styledPlan, cloudProvider);

    return { architecturePlan: styledPlan, diagramPlan };
}
