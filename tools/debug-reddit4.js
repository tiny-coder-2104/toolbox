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
  
  // Find all buttons with their text
  const allButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button, [role="button"]' 
  });
  console.log(`All buttons: ${allButtons.nodeIds?.length || 0}`);
  
  if (allButtons.nodeIds && allButtons.nodeIds.length > 0) {
    for (let i = 0; i < allButtons.nodeIds.length; i++) {
      const nodeId = allButtons.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.textContent.trim(); }',
        returnByValue: true
      });
      const text = textResult.result?.value || '';
      console.log(`  Button ${i}: "${text}"`);
    }
  }
  
  // Find contenteditable divs (title and body)
  const editables = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '[contenteditable="true"]' 
  });
  console.log(`\nContenteditable: ${editables.nodeIds?.length || 0}`);
  
  if (editables.nodeIds && editables.nodeIds.length > 0) {
    for (let i = 0; i < editables.nodeIds.length; i++) {
      const nodeId = editables.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return {placeholder: this.getAttribute("data-placeholder") || this.getAttribute("placeholder") || "", textContent: this.textContent?.substring(0, 100), className: this.className, id: this.id}; }',
        returnByValue: true
      });
      console.log(`  Editable ${i}:`, JSON.stringify(textResult.result?.value));
    }
  }
  
  ws.close();
}

main().catch(console.error);
