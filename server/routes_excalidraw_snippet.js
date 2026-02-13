
/**
 * Share Excalidraw diagram via MCP.
 * Body: { sessionId }
 */
router.post('/excalidraw/share', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);

        if (!session || !session.excalidrawJson) {
            return res.status(404).json({ error: 'Session or Excalidraw data not found' });
        }

        const { callExcalidrawTool } = await import('./mcp/excalidrawClient.js');
        console.log('[api] Calling Excalidraw MCP to export...');

        const result = await callExcalidrawTool('export_to_excalidraw', {
            json: JSON.stringify(session.excalidrawJson),
        });

        // Result content is [{ type: 'text', text: 'https://excalidraw.com/...' }]
        const url = result.content[0].text;
        res.json({ url });
    } catch (err) {
        console.error('[api] Excalidraw share error:', err);
        res.status(500).json({ error: 'Failed to share diagram', details: err.message });
    }
});
