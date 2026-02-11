/**
 * @fileoverview Ollama REST API client with retry logic and JSON extraction.
 */

import config from '../../config.js';

const { baseUrl, model: defaultModel, temperature, maxRetries, timeoutMs } = config.ollama;

/**
 * Call Ollama /api/chat endpoint.
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @param {number} [opts.temperature]
 * @returns {Promise<string>} assistant reply text
 */
export async function chat(messages, opts = {}) {
    const body = {
        model: opts.model || defaultModel,
        messages,
        stream: false,
        options: { temperature: opts.temperature ?? temperature },
        format: 'json',
    };

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), timeoutMs);

            const res = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: ctrl.signal,
            });
            clearTimeout(timer);

            if (!res.ok) {
                throw new Error(`Ollama returned ${res.status}: ${await res.text()}`);
            }

            const data = await res.json();
            return data.message?.content ?? '';
        } catch (err) {
            lastError = err;
            console.warn(`[ollama] attempt ${attempt}/${maxRetries} failed:`, err.message);
            if (attempt < maxRetries) {
                await sleep(1000 * Math.pow(2, attempt - 1));
            }
        }
    }
    throw new Error(`Ollama failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Extract and repair JSON from raw LLM output.
 * Strips markdown fences, trailing commas, and common artefacts.
 * @param {string} raw
 * @returns {object}
 */
export function extractJson(raw) {
    let cleaned = raw.trim();

    // Remove markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // Remove leading/trailing prose before/after JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    // Fix trailing commas before } or ]
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    // Fix single quotes → double quotes (careful approach)
    // Only if there are no double quotes at all (edge case)
    if (!cleaned.includes('"') && cleaned.includes("'")) {
        cleaned = cleaned.replace(/'/g, '"');
    }

    return JSON.parse(cleaned);
}

/** @param {number} ms */
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
