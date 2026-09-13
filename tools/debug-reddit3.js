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
  console.log('Connected to tab');
  
  await sendCmd(ws, 'DOM.enable');
  const doc = await sendCmd(ws, 'DOM.getDocument');
  
  // Find all input, textarea, and contenteditable elements
  const selectors = ['input', 'textarea', '[contenteditable="true"]', '[role="textbox"]'];
  for (const selector of selectors) {
    const elements = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: doc.root.nodeId, 
      selector 
    });
    console.log(`${selector}: ${elements.nodeIds?.length || 0} found`);
    
    if (elements.nodeIds && elements.nodeIds.length > 0) {
      for (let i = 0; i < Math.min(elements.nodeIds.length, 5); i++) {
        const nodeId = elements.nodeIds[i];
        const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
        const objId = result.object.objectId;
        const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: objId,
          functionDeclaration: 'function() { return {tag: this.tagName, placeholder: this.placeholder, type: this.type, name: this.name, id: this.id, value: this.value, textContent: this.textContent?.substring(0, 100)}; }',
          returnByValue: true
        });
        console.log(`  ${selector}[${i}]:`, JSON.stringify(textResult.result?.value));
      }
    }
  }
  
  // Find buttons with "Post" or "Submit" in text
  const allButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button, [role="button"]' 
  });
  console.log(`\nAll buttons: ${allButtons.nodeIds?.length || 0}`);
  
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
      if (text.toLowerCase().includes('post') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('create') || text.toLowerCase().includes('publish')) {
        console.log(`  Button ${i}: "${text}" <- POTENTIAL POST BUTTON`);
      }
    }
  }
  
  ws.close();
}

main().catch(console.error);
