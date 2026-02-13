
import { initExcalidrawClient, closeExcalidrawClient } from './server/mcp/excalidrawClient.js';

async function test() {
    try {
        console.log('Testing Excalidraw MCP connection...');
        await initExcalidrawClient();
        console.log('Connection successful.');
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await closeExcalidrawClient();
    }
}

test();
