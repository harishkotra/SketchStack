/**
 * @fileoverview Cloud icon style mappings for draw.io shapes.
 * Maps component types + cloud providers to draw.io mxGraph style strings.
 */

/** AWS service → draw.io style */
const AWS_ICONS = {
    serverless_function: 'shape=mxgraph.aws4.lambda_function;',
    storage: 'shape=mxgraph.aws4.s3;',
    database: 'shape=mxgraph.aws4.dynamodb;',
    api_gateway: 'shape=mxgraph.aws4.api_gateway;',
    queue: 'shape=mxgraph.aws4.sqs;',
    monitoring: 'shape=mxgraph.aws4.cloudwatch;',
    cache: 'shape=mxgraph.aws4.elasticache;',
    cdn: 'shape=mxgraph.aws4.cloudfront;',
    load_balancer: 'shape=mxgraph.aws4.elastic_load_balancing;',
    container: 'shape=mxgraph.aws4.ecs;',
    auth: 'shape=mxgraph.aws4.cognito;',
    search: 'shape=mxgraph.aws4.opensearch;',
    notification: 'shape=mxgraph.aws4.sns;',
    stream_processor: 'shape=mxgraph.aws4.kinesis;',
    secret_manager: 'shape=mxgraph.aws4.secrets_manager;',
    dns: 'shape=mxgraph.aws4.route_53;',
    waf: 'shape=mxgraph.aws4.waf;',
    logging: 'shape=mxgraph.aws4.cloudwatch;',
};

/** GCP service → draw.io style */
const GCP_ICONS = {
    serverless_function: 'shape=mxgraph.gcp2.cloud_functions;',
    container: 'shape=mxgraph.gcp2.cloud_run;',
    queue: 'shape=mxgraph.gcp2.cloud_pubsub;',
    database: 'shape=mxgraph.gcp2.cloud_sql;',
    storage: 'shape=mxgraph.gcp2.cloud_storage;',
    api_gateway: 'shape=mxgraph.gcp2.cloud_endpoints;',
    monitoring: 'shape=mxgraph.gcp2.cloud_monitoring;',
    logging: 'shape=mxgraph.gcp2.cloud_logging;',
    cache: 'shape=mxgraph.gcp2.memorystore;',
    load_balancer: 'shape=mxgraph.gcp2.cloud_load_balancing;',
    cdn: 'shape=mxgraph.gcp2.cloud_cdn;',
    search: 'shape=mxgraph.gcp2.cloud_search;',
    stream_processor: 'shape=mxgraph.gcp2.cloud_dataflow;',
    auth: 'shape=mxgraph.gcp2.cloud_iam;',
};

/** Azure service → draw.io style */
const AZURE_ICONS = {
    serverless_function: 'shape=mxgraph.azure.azure_function;',
    queue: 'shape=mxgraph.azure.service_bus;',
    database: 'shape=mxgraph.azure.cosmos_db;',
    storage: 'shape=mxgraph.azure.blob_storage;',
    api_gateway: 'shape=mxgraph.azure.api_management;',
    monitoring: 'shape=mxgraph.azure.monitor;',
    cache: 'shape=mxgraph.azure.redis_cache;',
    container: 'shape=mxgraph.azure.container_instances;',
    load_balancer: 'shape=mxgraph.azure.load_balancer;',
    cdn: 'shape=mxgraph.azure.cdn;',
    auth: 'shape=mxgraph.azure.active_directory;',
    logging: 'shape=mxgraph.azure.log_analytics;',
    notification: 'shape=mxgraph.azure.notification_hubs;',
};

/** Neutral / generic fallback styles */
const NEUTRAL_ICONS = {
    frontend: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;',
    backend: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    api_gateway: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontStyle=1;',
    load_balancer: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;',
    database: 'shape=cylinder3;fillColor=#F8CECC;strokeColor=#B85450;whiteSpace=wrap;fontStyle=1;size=15;',
    cache: 'shape=cylinder3;fillColor=#FFE6CC;strokeColor=#D79B00;whiteSpace=wrap;fontStyle=1;size=15;',
    queue: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;',
    storage: 'shape=cylinder3;fillColor=#E1D5E7;strokeColor=#9673A6;whiteSpace=wrap;fontStyle=1;size=15;',
    cdn: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;',
    auth: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#F8CECC;strokeColor=#B85450;fontStyle=1;',
    serverless_function: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    container: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    search: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    ml_model: 'shape=hexagon;perimeter=hexagonPerimeter2;fillColor=#E1D5E7;strokeColor=#9673A6;fontStyle=1;size=0.25;',
    vector_db: 'shape=cylinder3;fillColor=#E1D5E7;strokeColor=#9673A6;whiteSpace=wrap;fontStyle=1;size=15;',
    stream_processor: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;',
    monitoring: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;',
    logging: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;',
    notification: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;',
    scheduler: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;',
    proxy: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    service_mesh: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;',
    secret_manager: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#F8CECC;strokeColor=#B85450;fontStyle=1;',
    dns: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;',
    waf: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#F8CECC;strokeColor=#B85450;fontStyle=1;',
    other: 'shape=mxgraph.basic.rect;rounded=1;fillColor=#F5F5F5;strokeColor=#666666;fontStyle=1;',
};

/** Provider → icon map */
const PROVIDER_MAPS = {
    aws: AWS_ICONS,
    gcp: GCP_ICONS,
    azure: AZURE_ICONS,
    neutral: NEUTRAL_ICONS,
};

/**
 * Get the draw.io style string for a component type + provider.
 * Falls back to neutral style if no provider-specific icon exists.
 * @param {string} componentType
 * @param {string} cloudProvider - aws | gcp | azure | neutral
 * @returns {string} mxGraph style string
 */
export function getIconStyle(componentType, cloudProvider = 'neutral') {
    const providerMap = PROVIDER_MAPS[cloudProvider] || NEUTRAL_ICONS;
    const cloudStyle = providerMap[componentType];

    if (cloudStyle && cloudProvider !== 'neutral') {
        // For cloud provider shapes, add common styling
        return `${cloudStyle}aspect=fixed;resizable=0;fontStyle=1;`;
    }

    // Neutral fallback — always has full styling
    return NEUTRAL_ICONS[componentType] || NEUTRAL_ICONS.other;
}

/**
 * Get the display label prefix (emoji) for a component type.
 * @param {string} componentType
 * @returns {string}
 */
export function getTypeEmoji(componentType) {
    const emojis = {
        frontend: '🖥️',
        backend: '⚙️',
        api_gateway: '🚪',
        load_balancer: '⚖️',
        database: '🗄️',
        cache: '⚡',
        queue: '📨',
        storage: '💾',
        cdn: '🌐',
        auth: '🔐',
        serverless_function: '⚡',
        container: '📦',
        search: '🔍',
        ml_model: '🧠',
        vector_db: '🧮',
        stream_processor: '🌊',
        monitoring: '📊',
        logging: '📝',
        notification: '🔔',
        scheduler: '⏰',
        proxy: '🔀',
        service_mesh: '🕸️',
        secret_manager: '🔑',
        dns: '🌍',
        waf: '🛡️',
    };
    return emojis[componentType] || '📋';
}
