/**
 * @fileoverview SketchStack — AI System Architecture Generator
 * Entry point: Express server serving API + static frontend.
 */

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors'; // Import cors
import config from './config.js';
import apiRoutes from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors(config.cors)); // Enable CORS
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes ---
app.use('/api', apiRoutes);

// --- SPA fallback ---
app.get('{*path}', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start server ---
app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ⚡ SketchStack — AI Architecture Generator             ║
║                                                          ║
║   🌐  http://localhost:${config.port}                          ║
║   🤖  Ollama: ${config.ollama.baseUrl} (${config.ollama.model})        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
});

// --- Graceful shutdown ---
process.on('SIGINT', async () => {
    console.log('\n[server] Shutting down...');
    try {
        const { closeMcpClient } = await import('./server/mcp/mcpClient.js');
        await closeMcpClient();
    } catch (err) {
        // ignore
    }
    process.exit(0);
});
