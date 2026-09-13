'use strict';
const WebSocket = require('ws');

const PORT = 9222;
const TAB_ID = '6CCC39A5987661A656B5D4ED740364B5';
const WS_URL = `ws://127.0.0.1:${PORT}/devtools/page/${TAB_ID}`;

let cmdId = 1;

function sendCmd(ws, method, params, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const id = cmdId++;
    const timer = setTimeout(() => { 
      ws.removeListener('message', handler); 
      reject(new Error('CDP timeout after ' + timeout + 'ms')); 
    }, timeout);
    const handler = data => {
      const msg = JSON.parse(data);
      if (msg.id === id) { 
        clearTimeout(timer); 
        ws.removeListener('message', handler); 
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); 
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  const ws = new WebSocket(WS_URL);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  
  await sendCmd(ws, 'DOM.enable');
  const doc = await sendCmd(ws, 'DOM.getDocument');
  
  // Check buttons 4 and 5 (empty text) - might be icon buttons
  const buttons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button' 
  });
  
  if (buttons.nodeIds && buttons.nodeIds.length > 5) {
    for (let i = 4; i <= 5; i++) {
      const nodeId = buttons.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      
      // Get outerHTML to see the button structure
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML; }',
        returnByValue: true
      });
      console.log(`Button ${i} HTML:`, htmlResult.result?.value?.substring(0, 500));
      
      // Get attributes
      const attrsResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { const attrs = {}; for (let a of this.attributes) attrs[a.name] = a.value; return attrs; }',
        returnByValue: true
      });
      console.log(`Button ${i} attrs:`, JSON.stringify(attrsResult.result?.value));
    }
  }
  
  // Also check for any element with "Post" in className or data attributes
  const postElements = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '[class*="post" i], [data-testid*="post" i], [id*="post" i]' 
  });
  console.log(`\nPost-related elements: ${postElements.nodeIds?.length || 0}`);
  
  if (postElements.nodeIds && postElements.nodeIds.length > 0) {
    for (let i = 0; i < Math.min(postElements.nodeIds.length, 10); i++) {
      const nodeId = postElements.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML.substring(0, 300); }',
        returnByValue: true
      });
      console.log(`  Post element ${i}:`, htmlResult.result?.value);
    }
  }
  
  ws.close();
}

main().catch(console.error);
