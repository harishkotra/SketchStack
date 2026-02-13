/**
 * @fileoverview MCP client for the Excalidraw MCP server.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import config from '../../config.js';

let client = null;
let transport = null;

/**
 * Initialize the Excalidraw MCP client.
 * @returns {Promise<Client>}
 */
export async function initExcalidrawClient() {
    if (client) return client;

    console.log('[excalidraw-mcp] Starting Excalidraw MCP server...');

    transport = new StdioClientTransport({
        command: config.excalidraw.command,
        args: config.excalidraw.args,
    });

    client = new Client({
        name: 'sketchstack-excalidraw',
        version: '1.0.0',
    });

    try {
        await client.connect(transport);
        console.log('[excalidraw-mcp] Connected to Excalidraw MCP server');

        // List available tools
        const tools = await client.listTools();
        console.log('[excalidraw-mcp] Available tools:', tools.tools?.map((t) => t.name).join(', '));
        return client;
    } catch (err) {
        console.error('[excalidraw-mcp] Connection failed:', err.message);
        client = null; // Reset on failure
        throw err;
    }
}

/**
 * Call a tool on the Excalidraw MCP server.
 * @param {string} toolName
 * @param {object} args
 * @returns {Promise<any>}
 */
export async function callExcalidrawTool(toolName, args = {}) {
    const mcpClient = await initExcalidrawClient();
    try {
        const result = await mcpClient.callTool({
            name: toolName,
            arguments: args,
        });
        return result;
    } catch (err) {
        console.error(`[excalidraw-mcp] Tool call '${toolName}' failed:`, err.message);
        throw err;
    }
}

/**
 * Gracefully shut down.
 */
export async function closeExcalidrawClient() {
    if (client) {
        try {
            await client.close();
        } catch (err) {
            console.warn('[excalidraw-mcp] close error:', err.message);
        }
        client = null;
        console.log('[excalidraw-mcp] Disconnected');
    }
}
