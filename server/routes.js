/**
 * @fileoverview Express API routes for the architecture generator.
 */

import { Router } from 'express';
import { runPipeline, refinePlan, generateDiagramPlan } from './agents/architectureAgent.js';
import { buildMxGraphXml } from './diagram/xmlBuilder.js';
import { generateDrawioUrl, generateViewerUrl, exportAsDrawioXml } from './diagram/exporter.js';
import { openDiagramXml } from './mcp/mcpClient.js';
import { getPreset, listPresets } from './presets.js';
import config from '../config.js';

const router = Router();

/** In-memory session store for current diagram state */
const sessions = new Map();
let sessionCounter = 0;

/**
 * POST /api/generate
 * Generate a new architecture diagram from a natural language description.
 *
 * Body: { description, cloudProvider?, architectureStyle?, model? }
 * Returns: { sessionId, architecturePlan, diagramPlan, xml, drawioUrl, viewerUrl }
 */
router.post('/generate', async (req, res) => {
    try {
        const { description, cloudProvider, architectureStyle, model } = req.body;

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({ error: 'Description is required' });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('[api] Generating architecture diagram...');
        console.log(`[api] Cloud: ${cloudProvider || 'neutral'}, Style: ${architectureStyle || 'auto'}`);
        console.log(`[api] Description: ${description.slice(0, 100)}...`);
        console.log('='.repeat(60));

        const { architecturePlan, diagramPlan } = await runPipeline({
            description,
            cloudProvider: cloudProvider || 'neutral',
            architectureStyle: architectureStyle || undefined,
            model,
        });

        const xml = buildMxGraphXml(diagramPlan, cloudProvider || 'neutral', 'Architecture Diagram');
        const drawioUrl = generateDrawioUrl(xml);
        const viewerUrl = generateViewerUrl(xml);

        // Store session
        const sessionId = `session_${++sessionCounter}`;
        sessions.set(sessionId, {
            architecturePlan,
            diagramPlan,
            xml,
            cloudProvider: cloudProvider || 'neutral',
            description,
        });

        res.json({
            sessionId,
            architecturePlan,
            diagramPlan,
            xml,
            drawioUrl,
            viewerUrl,
        });
    } catch (err) {
        console.error('[api] Generate error:', err);
        res.status(500).json({
            error: 'Failed to generate diagram',
            details: err.message,
        });
    }
});

/**
 * POST /api/refine
 * Refine an existing architecture diagram.
 *
 * Body: { sessionId, instruction, cloudProvider?, model? }
 * Returns: { architecturePlan, diagramPlan, xml, drawioUrl, viewerUrl }
 */
router.post('/refine', async (req, res) => {
    try {
        const { sessionId, instruction, cloudProvider, model } = req.body;

        if (!instruction || typeof instruction !== 'string') {
            return res.status(400).json({ error: 'Instruction is required' });
        }

        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found. Generate a diagram first.' });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('[api] Refining architecture...');
        console.log(`[api] Instruction: ${instruction.slice(0, 100)}`);
        console.log('='.repeat(60));

        const provider = cloudProvider || session.cloudProvider;
        const updatedPlan = await refinePlan(session.architecturePlan, instruction, provider, model);
        const diagramPlan = generateDiagramPlan(updatedPlan, provider);
        const xml = buildMxGraphXml(diagramPlan, provider, 'Architecture Diagram (Refined)');
        const drawioUrl = generateDrawioUrl(xml);
        const viewerUrl = generateViewerUrl(xml);

        // Update session
        session.architecturePlan = updatedPlan;
        session.diagramPlan = diagramPlan;
        session.xml = xml;
        session.cloudProvider = provider;

        res.json({
            sessionId,
            architecturePlan: updatedPlan,
            diagramPlan,
            xml,
            drawioUrl,
            viewerUrl,
        });
    } catch (err) {
        console.error('[api] Refine error:', err);
        res.status(500).json({
            error: 'Failed to refine diagram',
            details: err.message,
        });
    }
});

/**
 * POST /api/open-in-drawio
 * Open current diagram in draw.io via MCP server.
 *
 * Body: { sessionId }
 */
router.post('/open-in-drawio', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const result = await openDiagramXml(session.xml);
        res.json({ success: true, result });
    } catch (err) {
        console.error('[api] MCP open error:', err);
        res.status(500).json({
            error: 'Failed to open in draw.io',
            details: err.message,
        });
    }
});

/**
 * GET /api/export/:format
 * Export the current diagram in the requested format.
 *
 * Query: ?sessionId=...
 * Formats: xml, drawio
 */
router.get('/export/:format', (req, res) => {
    const { format } = req.params;
    const { sessionId } = req.query;
    const session = sessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    switch (format) {
        case 'xml':
        case 'drawio': {
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', 'attachment; filename="architecture.drawio"');
            res.send(exportAsDrawioXml(session.xml));
            break;
        }
        case 'png':
        case 'svg':
        case 'pdf': {
            // Provide the draw.io export URL — user exports from the editor
            const drawioUrl = generateDrawioUrl(session.xml);
            res.json({
                message: `To export as ${format.toUpperCase()}, open the diagram in draw.io and use File → Export As → ${format.toUpperCase()}`,
                drawioUrl,
                viewerUrl: generateViewerUrl(session.xml),
            });
            break;
        }
        default:
            res.status(400).json({ error: `Unsupported format: ${format}` });
    }
});

/**
 * GET /api/presets
 * List all demo presets.
 */
router.get('/presets', (_req, res) => {
    res.json(listPresets());
});

/**
 * GET /api/presets/:name
 * Get a specific demo preset.
 */
router.get('/presets/:name', (req, res) => {
    const preset = getPreset(req.params.name);
    if (!preset) {
        return res.status(404).json({ error: 'Preset not found' });
    }
    res.json(preset);
});

/**
 * GET /api/config
 * Return client-safe configuration.
 */
router.get('/config', (_req, res) => {
    res.json({
        architectureStyles: config.architectureStyles,
        cloudProviders: config.cloudProviders,
        layers: config.layers,
        defaultModel: config.ollama.model,
    });
});

export default router;
