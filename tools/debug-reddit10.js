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
  console.log(`Post composer forms: ${form.nodeIds?.length || 0}`);
  
  if (form.nodeIds && form.nodeIds.length > 0) {
    const nodeId = form.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Find all buttons inside the form
    const buttons = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: nodeId, 
      selector: 'button, [role="button"]' 
    });
    console.log(`Buttons in form: ${buttons.nodeIds?.length || 0}`);
    
    if (buttons.nodeIds && buttons.nodeIds.length > 0) {
      for (let i = 0; i < buttons.nodeIds.length; i++) {
        const btnNodeId = buttons.nodeIds[i];
        const btnResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: btnNodeId });
        const btnObjId = btnResult.object.objectId;
        const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: btnObjId,
          functionDeclaration: 'function() { return this.textContent.trim(); }',
          returnByValue: true
        });
        const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: btnObjId,
          functionDeclaration: 'function() { return this.outerHTML; }',
          returnByValue: true
        });
        console.log(`  Form button ${i}: "${textResult.result?.value}"`);
        console.log(`  HTML: ${htmlResult.result?.value?.substring(0, 300)}`);
      }
    }
    
    // Find all inputs inside the form
    const inputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: nodeId, 
      selector: 'input, textarea, [contenteditable]' 
    });
    console.log(`\nInputs in form: ${inputs.nodeIds?.length || 0}`);
    
    if (inputs.nodeIds && inputs.nodeIds.length > 0) {
      for (let i = 0; i < inputs.nodeIds.length; i++) {
        const inpNodeId = inputs.nodeIds[i];
        const inpResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: inpNodeId });
        const inpObjId = inpResult.object.objectId;
        const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: inpObjId,
          functionDeclaration: 'function() { return this.outerHTML; }',
          returnByValue: true
        });
        console.log(`  Form input ${i}: ${htmlResult.result?.value?.substring(0, 300)}`);
      }
    }
  }
  
  // Also check the link shell for hidden inputs
  const linkShell = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '#post-composer_link-shell' 
  });
  console.log(`\nLink shells: ${linkShell.nodeIds?.length || 0}`);
  
  if (linkShell.nodeIds && linkShell.nodeIds.length > 0) {
    const nodeId = linkShell.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
      objectId: objId,
      functionDeclaration: 'function() { return this.outerHTML; }',
      returnByValue: true
    });
    console.log(`Link shell HTML:`, htmlResult.result?.value?.substring(0, 1000));
  }
  
  ws.close();
}

main().catch(console.error);
