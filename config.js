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

  /** Diagram layout */
  layout: {
    nodeWidth: 160,
    nodeHeight: 80,
    horizontalSpacing: 140, // Increased for horizontal routing
    verticalSpacing: 80,
    layerGap: 140,          // Increased for cross-layer routing
    startX: 60,
    startY: 60,
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
