/**
 * @fileoverview Prompt templates for refining / iterating on an existing architecture.
 */

/**
 * Build the system prompt for architecture refinement.
 * @returns {string}
 */
export function buildRefinementPrompt() {
    return `You are a senior cloud architect.
You are given an existing architecture plan as JSON and a user instruction to modify it.

Rules:
- Modify ONLY the parts affected by the instruction.
- Keep all existing component IDs stable when possible.
- Add new components with new unique IDs.
- Remove components only if explicitly requested.
- Preserve existing relationships that are not affected.
- Return the FULL updated JSON (not a diff).
- Return ONLY valid JSON — no prose, no markdown.

The JSON schema is the same as the original:
{
  "components": [...],
  "relationships": [...],
  "data_flows": [...],
  "infra": [...],
  "constraints": [...],
  "architecture_style": "string"
}`;
}

/**
 * Build the user message for refinement.
 * @param {object} existingPlan - Current architecture plan JSON
 * @param {string} instruction - User refinement instruction
 * @returns {string}
 */
export function buildRefinementUserMessage(existingPlan, instruction) {
    return `Here is the current architecture plan:

${JSON.stringify(existingPlan, null, 2)}

User instruction:
${instruction}

Return the FULL updated JSON. No prose.`;
}
