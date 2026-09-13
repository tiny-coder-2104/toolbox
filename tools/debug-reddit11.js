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
  
  // Find the post composer form
  const form = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'r-post-composer-form' 
  });
  
  if (form.nodeIds && form.nodeIds.length > 0) {
    const nodeId = form.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Find the "Next" button (button 3)
    const buttons = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: nodeId, 
      selector: 'button' 
    });
    
    if (buttons.nodeIds && buttons.nodeIds.length > 3) {
      const nextButtonNodeId = buttons.nodeIds[3]; // "Next" button
      const btnResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: nextButtonNodeId });
      const btnObjId = btnResult.object.objectId;
      
      // Click the Next button
      await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: btnObjId,
        functionDeclaration: 'function() { this.click(); }',
        returnByValue: true
      });
      console.log('Clicked "Next" button');
      
      // Wait for next step
      await new Promise(r => setTimeout(r, 2000));
      
      // Check for Post button now
      const newButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
        nodeId: nodeId, 
        selector: 'button, [role="button"]' 
      });
      console.log(`\nButtons after Next: ${newButtons.nodeIds?.length || 0}`);
      
      if (newButtons.nodeIds && newButtons.nodeIds.length > 0) {
        for (let i = 0; i < newButtons.nodeIds.length; i++) {
          const btnNodeId = newButtons.nodeIds[i];
          const btnResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: btnNodeId });
          const btnObjId = btnResult.object.objectId;
          const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
            objectId: btnObjId,
            functionDeclaration: 'function() { return this.textContent.trim(); }',
            returnByValue: true
          });
          console.log(`  Button ${i}: "${textResult.result?.value}"`);
        }
      }
    }
  }
  
  ws.close();
}

main().catch(console.error);
