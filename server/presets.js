/**
 * @fileoverview Demo presets — pre-built prompts for common architecture patterns.
 */

export const PRESETS = {
    'rag-pipeline': {
        name: 'RAG Pipeline',
        description:
            'Build a Retrieval-Augmented Generation pipeline that ingests PDFs, chunks them into semantic segments, generates vector embeddings, stores them in a vector database (Pinecone/Weaviate), and answers user questions by retrieving relevant context and passing it to an LLM. Include a FastAPI backend, a React chat UI, and observability with logging and monitoring.',
        cloudProvider: 'aws',
        architectureStyle: 'rag-pipeline',
    },

    microservices: {
        name: 'Microservices E-Commerce',
        description:
            'Design a microservices-based e-commerce backend with: API Gateway for routing, Auth Service with JWT tokens, Product Catalog service with PostgreSQL, Order Service with event sourcing, Payment Service integrating with Stripe, Notification Service (email + push), a message queue (RabbitMQ/SQS) for async communication between services, Redis cache for product listings, CDN for static assets, and centralized logging with ELK stack. Each service should be independently deployable in Docker containers.',
        cloudProvider: 'aws',
        architectureStyle: 'microservices',
    },

    'agent-system': {
        name: 'Multi-Agent AI System',
        description:
            'Create a multi-agent AI workflow system where: an Orchestrator Agent receives user tasks and delegates to specialized agents — a Research Agent that searches the web and summarizes findings, a Code Agent that writes and reviews code, a Data Agent that queries databases and generates reports. Agents communicate via a message queue. Include a vector database for agent memory, an LLM gateway (supporting OpenAI and local Ollama), a REST API for the frontend, a React dashboard showing agent activity, and a monitoring system tracking token usage, latency, and errors.',
        cloudProvider: 'neutral',
        architectureStyle: 'agent-workflow',
    },

    'event-driven-orders': {
        name: 'Event-Driven Order System',
        description:
            'Build an event-driven order processing system: customers place orders via a web app, orders go through an API Gateway to an Order Service. Order events are published to Kafka/EventBridge. A Payment Processor consumes payment events, an Inventory Service updates stock, a Shipping Service arranges delivery, and a Notification Service sends order updates via email and SMS. Include a dead letter queue for failed events, CQRS with separate read/write databases, and CloudWatch/Datadog for monitoring.',
        cloudProvider: 'aws',
        architectureStyle: 'event-driven',
    },

    'streaming-analytics': {
        name: 'Streaming Analytics Pipeline',
        description:
            'Design a real-time streaming analytics pipeline: IoT sensors push data via MQTT to an ingestion gateway. Data flows through Kafka/Kinesis streams to a stream processor (Flink/Spark Streaming) for real-time aggregations and anomaly detection. Processed data lands in a data lake (S3/GCS) and a time-series database (InfluxDB/TimescaleDB). A batch processing layer (Spark) runs daily aggregations. Results are served via a REST API to a Grafana dashboard. Include schema registry, data quality checks, and alerting.',
        cloudProvider: 'aws',
        architectureStyle: 'data-pipeline',
    },
};

/**
 * Get a preset by name.
 * @param {string} name
 * @returns {object|null}
 */
export function getPreset(name) {
    return PRESETS[name] || null;
}

/**
 * List all available presets.
 * @returns {Array<{id: string, name: string}>}
 */
export function listPresets() {
    return Object.entries(PRESETS).map(([id, preset]) => ({
        id,
        name: preset.name,
    }));
}
