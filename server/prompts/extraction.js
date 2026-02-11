/**
 * @fileoverview Prompt templates for architecture extraction from natural language.
 */

/**
 * Build the system prompt for requirement extraction.
 * @param {string} cloudProvider - aws | gcp | azure | neutral
 * @returns {string}
 */
export function buildExtractionPrompt(cloudProvider = 'neutral') {
    return `You are a senior cloud architect.
Your task: extract system components and relationships from the user's architecture description.
Cloud preference: ${cloudProvider}.

Return ONLY valid JSON — no prose, no markdown, no explanation.

The JSON must follow this exact schema:
{
  "components": [
    {
      "id": "string (unique snake_case identifier)",
      "name": "string (human-readable name)",
      "type": "string (one of: frontend, backend, api_gateway, load_balancer, database, cache, queue, storage, cdn, auth, serverless_function, container, search, ml_model, vector_db, stream_processor, monitoring, logging, notification, scheduler, proxy, service_mesh, secret_manager, dns, waf, other)",
      "description": "string (brief purpose)"
    }
  ],
  "relationships": [
    {
      "from": "string (component id)",
      "to": "string (component id)",
      "label": "string (relationship description)",
      "protocol": "string (e.g. REST, gRPC, WebSocket, AMQP, Kafka, HTTP, TCP, UDP, custom)"
    }
  ],
  "data_flows": [
    {
      "from": "string (component id)",
      "to": "string (component id)",
      "data": "string (what data flows)"
    }
  ],
  "infra": [
    {
      "id": "string",
      "name": "string",
      "type": "string (e.g. vpc, subnet, cluster, region, availability_zone, namespace)"
    }
  ],
  "constraints": ["string (e.g. must be highly available, low latency, GDPR compliant)"],
  "architecture_style": "string (one of: microservices, serverless, monolith, event-driven, rag-pipeline, data-pipeline, agent-workflow, layered, hexagonal)"
}

## Few-shot examples

### Example 1 — User says: "A RAG pipeline that ingests PDFs, chunks them, stores embeddings in a vector DB, and answers questions"
{
  "components": [
    {"id": "pdf_ingestion", "name": "PDF Ingestion Service", "type": "backend", "description": "Ingests and parses PDF documents"},
    {"id": "chunker", "name": "Text Chunker", "type": "backend", "description": "Splits documents into semantic chunks"},
    {"id": "embedding_model", "name": "Embedding Model", "type": "ml_model", "description": "Generates vector embeddings from text chunks"},
    {"id": "vector_db", "name": "Vector Database", "type": "vector_db", "description": "Stores and indexes document embeddings"},
    {"id": "llm", "name": "LLM", "type": "ml_model", "description": "Generates answers using retrieved context"},
    {"id": "api", "name": "Query API", "type": "api_gateway", "description": "Accepts user questions and returns answers"},
    {"id": "frontend", "name": "Chat UI", "type": "frontend", "description": "User interface for asking questions"}
  ],
  "relationships": [
    {"from": "pdf_ingestion", "to": "chunker", "label": "sends raw text", "protocol": "internal"},
    {"from": "chunker", "to": "embedding_model", "label": "sends chunks", "protocol": "internal"},
    {"from": "embedding_model", "to": "vector_db", "label": "stores embeddings", "protocol": "REST"},
    {"from": "api", "to": "vector_db", "label": "similarity search", "protocol": "REST"},
    {"from": "api", "to": "llm", "label": "sends context + question", "protocol": "REST"},
    {"from": "frontend", "to": "api", "label": "user query", "protocol": "HTTP"}
  ],
  "data_flows": [
    {"from": "pdf_ingestion", "to": "vector_db", "data": "document embeddings"},
    {"from": "frontend", "to": "llm", "data": "user questions → AI answers"}
  ],
  "infra": [],
  "constraints": ["Low latency retrieval", "Scalable embedding storage"],
  "architecture_style": "rag-pipeline"
}

### Example 2 — User says: "Microservice e-commerce with API gateway, auth, product catalog, orders, payments, and a message queue"
{
  "components": [
    {"id": "api_gw", "name": "API Gateway", "type": "api_gateway", "description": "Routes requests to microservices"},
    {"id": "auth_svc", "name": "Auth Service", "type": "auth", "description": "Handles authentication and authorization"},
    {"id": "product_svc", "name": "Product Catalog", "type": "backend", "description": "Manages product listings"},
    {"id": "order_svc", "name": "Order Service", "type": "backend", "description": "Manages orders and order state"},
    {"id": "payment_svc", "name": "Payment Service", "type": "backend", "description": "Processes payments"},
    {"id": "product_db", "name": "Product DB", "type": "database", "description": "Stores product data"},
    {"id": "order_db", "name": "Order DB", "type": "database", "description": "Stores order data"},
    {"id": "msg_queue", "name": "Message Queue", "type": "queue", "description": "Async communication between services"},
    {"id": "frontend", "name": "Web Store", "type": "frontend", "description": "Customer-facing storefront"}
  ],
  "relationships": [
    {"from": "frontend", "to": "api_gw", "label": "HTTP requests", "protocol": "HTTPS"},
    {"from": "api_gw", "to": "auth_svc", "label": "auth check", "protocol": "REST"},
    {"from": "api_gw", "to": "product_svc", "label": "product queries", "protocol": "REST"},
    {"from": "api_gw", "to": "order_svc", "label": "order operations", "protocol": "REST"},
    {"from": "order_svc", "to": "payment_svc", "label": "payment request", "protocol": "REST"},
    {"from": "order_svc", "to": "msg_queue", "label": "order events", "protocol": "AMQP"},
    {"from": "product_svc", "to": "product_db", "label": "CRUD", "protocol": "TCP"},
    {"from": "order_svc", "to": "order_db", "label": "CRUD", "protocol": "TCP"}
  ],
  "data_flows": [
    {"from": "frontend", "to": "order_db", "data": "customer orders"},
    {"from": "order_svc", "to": "payment_svc", "data": "payment intents"}
  ],
  "infra": [],
  "constraints": ["Independently deployable services", "Eventual consistency via message queue"],
  "architecture_style": "microservices"
}`;
}

/**
 * Build the user message for extraction.
 * @param {string} description - User's natural language architecture description
 * @returns {string}
 */
export function buildExtractionUserMessage(description) {
    return `Analyze the following system architecture description and extract all components, relationships, data flows, infrastructure, constraints, and architecture style.

Description:
${description}

Return ONLY the JSON object. No prose.`;
}
