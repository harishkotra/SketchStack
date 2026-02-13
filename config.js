/**
 * @fileoverview Central configuration for the SketchStack application.
 * All tunables — Ollama endpoint, model, MCP server, layout spacing, etc.
 */

const config = {
  /** Express server */
  port: parseInt(process.env.PORT || '3000', 10),

  /** Ollama LLM */
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2',
    temperature: 0.3,
    maxRetries: 3,
    timeoutMs: 120_000,
  },

  /** draw.io MCP server */
  mcp: {
    command: 'npx',
    args: ['@drawio/mcp'],
    timeoutMs: 30_000,
    maxRetries: 2,
  },

  excalidraw: {
    command: 'node',
    args: ['server/mcp/excalidraw-mcp/dist/index.js', '--stdio'],
    maxRetries: 3,
  },

  /** Diagram layout */
  layout: {
    nodeWidth: 220,
    nodeHeight: 110,
    horizontalSpacing: 300,
    verticalSpacing: 200,
    layerGap: 400,
    startX: 100,
    startY: 100,
  },

  /** Layer ordering (top → bottom) */
  layers: ['Security', 'Application', 'Data', 'Infra', 'Observability'],

  /** Supported architecture styles */
  architectureStyles: [
    'microservices',
    'serverless',
    'monolith',
    'event-driven',
    'rag-pipeline',
    'data-pipeline',
    'agent-workflow',
    'layered',
    'hexagonal',
  ],

  /** Cloud providers */
  cloudProviders: ['aws', 'gcp', 'azure', 'neutral'],

  /** API Security */
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
};

export default config;
