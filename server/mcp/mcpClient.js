/**
 * @fileoverview MCP client for the draw.io MCP server.
 * Connects via stdio and calls open_drawio_xml / open_drawio_mermaid / open_drawio_csv.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import config from '../../config.js';

let client = null;
let transport = null;

/**
 * Initialize the MCP client — spawns the draw.io MCP server process.
 * @returns {Promise<Client>}
 */
export async function initMcpClient() {
    if (client) return client;

    console.log('[mcp] Starting draw.io MCP server...');

    transport = new StdioClientTransport({
        command: config.mcp.command,
        args: config.mcp.args,
    });

    client = new Client({
        name: 'sketchstack',
        version: '1.0.0',
    });

    await client.connect(transport);
    console.log('[mcp] Connected to draw.io MCP server');

    // List available tools
    try {
        const tools = await client.listTools();
        console.log('[mcp] Available tools:', tools.tools?.map((t) => t.name).join(', '));
    } catch (err) {
        console.warn('[mcp] Could not list tools:', err.message);
    }

    return client;
}

/**
 * Open a diagram in draw.io using XML content.
 * @param {string} xmlContent - mxGraph XML
 * @param {object} [opts]
 * @param {boolean} [opts.lightbox=false]
 * @param {string} [opts.dark='auto']
 * @returns {Promise<object>} MCP tool result
 */
export async function openDiagramXml(xmlContent, opts = {}) {
    const mcpClient = await initMcpClient();

    let lastError;
    for (let attempt = 1; attempt <= config.mcp.maxRetries; attempt++) {
        try {
            const result = await mcpClient.callTool({
                name: 'open_drawio_xml',
                arguments: {
                    content: xmlContent,
                    lightbox: opts.lightbox ?? false,
                    dark: opts.dark ?? 'auto',
                },
            });
            console.log('[mcp] Diagram opened successfully');
            return result;
        } catch (err) {
            lastError = err;
            console.warn(`[mcp] attempt ${attempt}/${config.mcp.maxRetries} failed:`, err.message);
            if (attempt < config.mcp.maxRetries) {
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
    }
    throw new Error(`MCP open_drawio_xml failed after ${config.mcp.maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Open a diagram in draw.io using Mermaid syntax.
 * @param {string} mermaidContent
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
export async function openDiagramMermaid(mermaidContent, opts = {}) {
    const mcpClient = await initMcpClient();

    const result = await mcpClient.callTool({
        name: 'open_drawio_mermaid',
        arguments: {
            content: mermaidContent,
            lightbox: opts.lightbox ?? false,
            dark: opts.dark ?? 'auto',
        },
    });

    return result;
}

/**
 * Open a diagram in draw.io using CSV content.
 * @param {string} csvContent
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
export async function openDiagramCsv(csvContent, opts = {}) {
    const mcpClient = await initMcpClient();

    const result = await mcpClient.callTool({
        name: 'open_drawio_csv',
        arguments: {
            content: csvContent,
            lightbox: opts.lightbox ?? false,
            dark: opts.dark ?? 'auto',
        },
    });

    return result;
}

/**
 * Gracefully shut down the MCP client.
 */
export async function closeMcpClient() {
    if (client) {
        try {
            await client.close();
        } catch (err) {
            console.warn('[mcp] close error:', err.message);
        }
        client = null;
        transport = null;
        console.log('[mcp] Disconnected');
    }
}
