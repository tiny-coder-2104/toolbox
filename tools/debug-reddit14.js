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
  
  // Find the faceplate-textarea-input for link
  const faceplateInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'faceplate-textarea-input[name="link"]' 
  });
  
  if (faceplateInputs.nodeIds && faceplateInputs.nodeIds.length > 0) {
    const nodeId = faceplateInputs.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Get the shadow root
    const shadowRoot = await sendCmd(ws, 'DOM.getShadowRoot', { nodeId });
    console.log('Shadow root:', shadowRoot);
    
    if (shadowRoot && shadowRoot.shadowRoot) {
      const shadowNodeId = shadowRoot.shadowRoot.nodeId;
      // Find inputs in shadow DOM
      const shadowInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
        nodeId: shadowNodeId, 
        selector: 'input, textarea' 
      });
      console.log(`Shadow inputs: ${shadowInputs.nodeIds?.length || 0}`);
      
      if (shadowInputs.nodeIds && shadowInputs.nodeIds.length > 0) {
        for (let i = 0; i < shadowInputs.nodeIds.length; i++) {
          const innerNodeId = shadowInputs.nodeIds[i];
          const innerResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: innerNodeId });
          const innerObjId = innerResult.object.objectId;
          const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
            objectId: innerObjId,
            functionDeclaration: 'function() { return this.outerHTML; }',
            returnByValue: true
          });
          console.log(`  Shadow input ${i}: ${htmlResult.result?.value?.substring(0, 300)}`);
        }
      }
    }
  }
  
  // Also check the post composer form for shadow DOM
  const forms = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'r-post-composer-form' 
  });
  
  if (forms.nodeIds && forms.nodeIds.length > 0) {
    const nodeId = forms.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    const shadowRoot = await sendCmd(ws, 'DOM.getShadowRoot', { nodeId });
    console.log('\nForm shadow root:', shadowRoot);
  }
  
  ws.close();
}

main().catch(console.error);
