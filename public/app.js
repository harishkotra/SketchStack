/**
 * @fileoverview SketchStack — Frontend application logic.
 * Handles UI interactions, API calls, and diagram rendering.
 */

(function () {
    'use strict';

    // ─── DOM References ───
    const $description = document.getElementById('description');
    const $cloudProvider = document.getElementById('cloud-provider');
    const $architectureStyle = document.getElementById('architecture-style');
    const $btnGenerate = document.getElementById('btn-generate');
    const $btnRefine = document.getElementById('btn-refine');
    const $refineSection = document.getElementById('refine-section');
    const $refineInput = document.getElementById('refine-input');
    const $status = document.getElementById('status');
    const $exportButtons = document.getElementById('export-buttons');
    const $btnOpenDrawio = document.getElementById('btn-open-drawio');
    const $diagramPlaceholder = document.getElementById('diagram-placeholder');
    const $diagramIframe = document.getElementById('diagram-iframe');
    const $detailsSection = document.getElementById('details-section');
    const $loadingOverlay = document.getElementById('loading-overlay');
    const $loadingTitle = document.getElementById('loading-title');
    const $presetsGrid = document.getElementById('presets-grid');

    // Tab elements
    const $tabComponents = document.getElementById('tab-components');
    const $tabRelationships = document.getElementById('tab-relationships');
    const $tabJson = document.getElementById('tab-json');

    // ─── State ───
    let currentSession = null;
    let currentData = null;

    // ─── Initialize ───
    init();

    function init() {
        // Preset buttons
        $presetsGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.preset-btn');
            if (!btn) return;
            loadPreset(btn.dataset.preset);
        });

        // Generate button
        $btnGenerate.addEventListener('click', handleGenerate);

        // Refine button
        $btnRefine.addEventListener('click', handleRefine);

        // Export buttons
        document.querySelectorAll('.btn-export').forEach((btn) => {
            btn.addEventListener('click', () => handleExport(btn.dataset.format));
        });

        // Open in draw.io
        $btnOpenDrawio.addEventListener('click', handleOpenDrawio);

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Enter key on refine input
        $refineInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleRefine();
        });
    }

    // ─── Preset Loading ───
    async function loadPreset(presetName) {
        try {
            const res = await fetch(`/api/presets/${presetName}`);
            if (!res.ok) throw new Error('Preset not found');
            const preset = await res.json();

            $description.value = preset.description;
            $cloudProvider.value = preset.cloudProvider || 'neutral';
            $architectureStyle.value = preset.architectureStyle || '';

            // Highlight active preset
            document.querySelectorAll('.preset-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.preset === presetName);
            });

            showStatus(`Loaded "${preset.name}" preset. Click Generate to create the diagram.`, 'success');
        } catch (err) {
            showStatus('Failed to load preset: ' + err.message, 'error');
        }
    }

    // ─── Generate Handler ───
    async function handleGenerate() {
        const description = $description.value.trim();
        if (!description) {
            showStatus('Please enter an architecture description.', 'error');
            return;
        }

        const format = document.getElementById('diagram-format').value;
        const step4Text = format === 'excalidraw' ? 'Building Excalidraw JSON...' : 'Building draw.io XML...';
        document.querySelector('#step-4 span:last-child').textContent = step4Text;

        showLoading('Generating Architecture...');
        $btnGenerate.disabled = true;
        hideStatus();

        try {
            animateLoadingStep(1);

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    cloudProvider: $cloudProvider.value,
                    architectureStyle: $architectureStyle.value || undefined,
                    format,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || 'Generation failed');
            }

            animateLoadingStep(4);
            const data = await res.json();

            currentSession = data.sessionId;
            currentData = data;

            renderDiagram(data);
            renderDetails(data);
            showUI();

            showStatus(`✅ Generated ${data.diagramPlan.nodes.length} components and ${data.diagramPlan.edges.length} connections.`, 'success');
        } catch (err) {
            showStatus('❌ ' + err.message, 'error');
        } finally {
            hideLoading();
            $btnGenerate.disabled = false;
        }
    }

    // ─── Refine Handler ───
    async function handleRefine() {
        const instruction = $refineInput.value.trim();
        if (!instruction) return;
        if (!currentSession) {
            showStatus('Generate a diagram first before refining.', 'error');
            return;
        }

        showLoading('Refining Architecture...');
        hideStatus();

        try {
            const res = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSession,
                    instruction,
                    cloudProvider: $cloudProvider.value,
                    architectureStyle: $architectureStyle.value || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || 'Refinement failed');
            }

            const data = await res.json();
            currentSession = data.sessionId;
            currentData = data;

            renderDiagram(data);
            renderDetails(data);

            $refineInput.value = '';
            showStatus(`✅ Refined: ${data.diagramPlan.nodes.length} components, ${data.diagramPlan.edges.length} connections.`, 'success');
        } catch (err) {
            showStatus('❌ ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    }

    // ─── Export Handler ───
    async function handleExport(format) {
        if (!currentSession) return;

        if (format === 'drawio' || format === 'xml') {
            // Direct file download
            window.open(`/api/export/drawio?sessionId=${currentSession}`, '_blank');
            return;
        }

        // For PNG/SVG/PDF — open draw.io where user can export
        if (currentData?.drawioUrl) {
            window.open(currentData.drawioUrl, '_blank');
            showStatus(`Opened in draw.io editor. Use File → Export As → ${format.toUpperCase()} to save.`, 'success');
        }
    }

    // ─── Open in draw.io via MCP ───
    async function handleOpenDrawio() {
        if (!currentSession) return;

        // Open the draw.io URL directly in browser
        if (currentData?.drawioUrl) {
            window.open(currentData.drawioUrl, '_blank');
            showStatus('Opened diagram in draw.io editor.', 'success');
            return;
        }

        // Fallback: try MCP
        try {
            const res = await fetch('/api/open-in-drawio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSession }),
            });

            if (!res.ok) throw new Error('MCP connection failed');
            showStatus('Opened in draw.io editor.', 'success');
        } catch (err) {
            showStatus('Could not connect to draw.io MCP. Opening URL instead...', 'error');
            if (currentData?.drawioUrl) window.open(currentData.drawioUrl, '_blank');
        }
    }

    // ─── Render Diagram ───
    function renderDiagram(data) {
        // Excalidraw Mode
        if (data.excalidrawJson) {
            $diagramPlaceholder.classList.add('hidden');
            $diagramIframe.src = '/mcp/app';
            $diagramIframe.classList.remove('hidden');

            // Store data for the handshake
            currentData.pendingExcalidrawJson = data.excalidrawJson;
            return;
        }

        // Draw.io Mode
        if (data.viewerUrl) {
            $diagramPlaceholder.innerHTML = '';
            $diagramPlaceholder.classList.add('hidden');
            $diagramIframe.src = data.viewerUrl;
            $diagramIframe.classList.remove('hidden');
        }
    }

    // ─── MCP App Host Protocol ───
    window.addEventListener('message', async (event) => {
        // Security check: ensure origin matches (self)
        if (event.origin !== window.origin) return;

        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        // 1. Handshake: ui/initialize
        if (msg.method === 'ui/initialize') {
            console.log('[MCP Host] Handshake received:', JSON.stringify(msg));
            const response = {
                jsonrpc: '2.0',
                id: msg.id,
                result: {
                    protocolVersion: '2025-11-21',
                    hostInfo: {
                        name: 'SketchStack',
                        version: '1.0.0'
                    },
                    hostCapabilities: {
                        logging: {},
                        serverTools: { listChanged: true }
                    },
                    hostContext: {
                        containerDimensions: {
                            width: document.getElementById('diagram-iframe').getBoundingClientRect().width || 800,
                            height: document.getElementById('diagram-iframe').getBoundingClientRect().height || 600
                        },
                        displayMode: 'inline',
                        theme: 'light'
                    }
                }
            };
            // Send back to the iframe
            const iframeWindow = document.getElementById('diagram-iframe').contentWindow;
            if (iframeWindow) {
                iframeWindow.postMessage(response, window.origin);

                // 2. Send initial data if we have it
                if (currentData.pendingExcalidrawJson) {
                    console.log('[MCP Host] Sending initial diagram data...');
                    const notification = {
                        jsonrpc: '2.0',
                        method: 'ui/notifications/tool-input',
                        params: {
                            arguments: {
                                elements: currentData.pendingExcalidrawJson.elements
                            }
                        }
                    };
                    iframeWindow.postMessage(notification, window.origin);
                    currentData.pendingExcalidrawJson = null;
                }
            }
            return;
        }

        // 3. Proxy tool calls: tools/call
        if (msg.method === 'tools/call') {
            console.log('[MCP Host] Tool call:', msg.params.name);
            const iframeWindow = document.getElementById('diagram-iframe').contentWindow;
            if (!iframeWindow) return;

            try {
                const res = await fetch('/api/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'tools/call',
                        params: msg.params
                    })
                });
                const data = await res.json();

                const response = {
                    jsonrpc: '2.0',
                    id: msg.id,
                    result: data.result
                };
                iframeWindow.postMessage(response, window.origin);
            } catch (err) {
                console.error('[MCP Host] Tool call failed:', err);
                const errorResponse = {
                    jsonrpc: '2.0',
                    id: msg.id,
                    error: {
                        code: -32000,
                        message: err.message
                    }
                };
                iframeWindow.postMessage(errorResponse, window.origin);
            }
        }

        // 4. Handle display mode requests (Fullscreen toggle)
        if (msg.method === 'ui/request-display-mode') {
            const mode = msg.params.mode;
            console.log('[MCP Host] Display mode request:', mode);

            const iframe = document.getElementById('diagram-iframe');
            const container = document.getElementById('diagram-container');

            if (mode === 'fullscreen') {
                container.classList.add('fullscreen');
                // Allow interactions
                iframe.style.pointerEvents = 'all';
            } else {
                container.classList.remove('fullscreen');
                // Disable interactions in inline mode (optional, but consistent with "preview")
                // iframe.style.pointerEvents = 'none'; 
            }

            // Acknowledge the mode change
            const response = {
                jsonrpc: '2.0',
                id: msg.id,
                result: { mode }
            };
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
                iframeWindow.postMessage(response, window.origin);

                // Also notify context changed
                const notification = {
                    jsonrpc: '2.0',
                    method: 'ui/notifications/host-context-changed',
                    params: {
                        displayMode: mode,
                        containerDimensions: {
                            width: iframe.getBoundingClientRect().width,
                            height: iframe.getBoundingClientRect().height
                        }
                    }
                };
                iframeWindow.postMessage(notification, window.origin);
            }
        }

        // 5. Handle logging from guest (notifications/message)
        if (msg.method === 'notifications/message') {
            const params = msg.params || {};
            const level = params.level || 'info';
            const logger = params.logger || 'Guest';
            const data = params.data;
            console.log(`[MCP ${logger}] [${level}]`, data);
        }
    });

    // ─── Render Details ───
    function renderDetails(data) {
        const plan = data.architecturePlan;
        const diagram = data.diagramPlan;

        // Components tab
        if (plan?.components) {
            $tabComponents.innerHTML = `<ul class="component-list">${plan.components
                .map(
                    (c) => `<li class="component-item">
            <span class="component-badge">${escHtml(c.type)}</span>
            <span class="component-name">${escHtml(c.name)}</span>
            <span class="component-desc">${escHtml(c.description || '')}</span>
          </li>`
                )
                .join('')}</ul>`;
        }

        // Relationships tab
        if (plan?.relationships) {
            $tabRelationships.innerHTML = `<ul class="component-list">${plan.relationships
                .map(
                    (r) => `<li class="relationship-item">
            <span>${escHtml(r.from)}</span>
            <span class="rel-arrow">→</span>
            <span>${escHtml(r.to)}</span>
            <span class="rel-protocol">${escHtml(r.protocol || '')}</span>
            <span class="component-desc">${escHtml(r.label || '')}</span>
          </li>`
                )
                .join('')}</ul>`;
        }

        // JSON tab
        $tabJson.innerHTML = `<pre>${escHtml(JSON.stringify(plan, null, 2))}</pre>`;
    }

    // ─── Tab Switching ───
    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
        const target = document.getElementById(`tab-${tabName}`);
        if (target) target.classList.remove('hidden');
    }

    // ─── Show/Hide UI elements ───
    function showUI() {
        $refineSection.classList.remove('hidden');

        // Hide Draw.io export buttons if in Excalidraw mode
        if (currentData && currentData.excalidrawJson) {
            $exportButtons.classList.add('hidden');
        } else {
            $exportButtons.classList.remove('hidden');
        }

        $detailsSection.classList.remove('hidden');
    }

    function showStatus(message, type) {
        $status.textContent = message;
        $status.className = `status ${type}`;
        $status.classList.remove('hidden');
    }

    function hideStatus() {
        $status.classList.add('hidden');
    }

    // ─── Loading Overlay ───
    function showLoading(title) {
        $loadingTitle.textContent = title || 'Processing...';
        // Reset steps
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step-${i}`);
            step.classList.remove('active', 'done');
        }
        document.getElementById('step-1').classList.add('active');
        $loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        $loadingOverlay.classList.add('hidden');
    }

    function animateLoadingStep(stepNum) {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step-${i}`);
            step.classList.remove('active', 'done');
            if (i < stepNum) step.classList.add('done');
            if (i === stepNum) step.classList.add('active');
        }
    }

    // ─── Utilities ───
    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
