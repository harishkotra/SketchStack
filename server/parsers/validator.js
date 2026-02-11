/**
 * @fileoverview Validates LLM output against Zod schemas with auto-retry.
 */

import { chat, extractJson } from '../ollama/client.js';

/**
 * Validate raw JSON string against a Zod schema.
 * If invalid, send correction prompt to LLM for auto-retry.
 * @param {string} rawText - Raw text from LLM (may contain markdown fences)
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {object} [opts]
 * @param {number} [opts.maxRetries=2] - Max correction attempts
 * @param {string} [opts.model] - Override Ollama model
 * @returns {Promise<object>} Validated object
 */
export async function validateAndRetry(rawText, schema, opts = {}) {
    const maxRetries = opts.maxRetries ?? 2;
    let lastRaw = rawText;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const parsed = extractJson(lastRaw);
            const validated = schema.parse(parsed);
            return validated;
        } catch (err) {
            lastError = err;
            console.warn(`[validator] attempt ${attempt + 1} validation failed:`, err.message?.slice(0, 200));

            if (attempt < maxRetries) {
                // Ask LLM to fix the JSON
                const correctionMessages = [
                    {
                        role: 'system',
                        content: 'You are a JSON repair assistant. Fix the JSON below so it matches the required schema. Return ONLY the corrected JSON, no prose.',
                    },
                    {
                        role: 'user',
                        content: `The following JSON failed validation.

Error: ${err.message?.slice(0, 500)}

Original JSON:
${lastRaw}

Fix the JSON and return ONLY the corrected JSON.`,
                    },
                ];

                lastRaw = await chat(correctionMessages, { model: opts.model });
            }
        }
    }

    throw new Error(`Validation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}
