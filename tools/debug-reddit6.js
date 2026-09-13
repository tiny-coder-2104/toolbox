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
  
  // Search for elements with "Link" or "Post" in text
  const allElements = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '*' 
  });
  console.log(`Total elements: ${allElements.nodeIds?.length || 0}`);
  
  // Check for tabs/role=tab
  const tabs = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '[role="tab"], [data-testid*="post-type"], [data-testid*="tab"]' 
  });
  console.log(`Tabs: ${tabs.nodeIds?.length || 0}`);
  
  if (tabs.nodeIds && tabs.nodeIds.length > 0) {
    for (let i = 0; i < tabs.nodeIds.length; i++) {
      const nodeId = tabs.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.textContent.trim(); }',
        returnByValue: true
      });
      console.log(`  Tab ${i}: "${textResult.result?.value}"`);
    }
  }
  
  // Check for input with type=url or placeholder with url/link
  const urlInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'input[type="url"], input[placeholder*="url" i], input[placeholder*="link" i], input[name*="url" i]' 
  });
  console.log(`URL inputs: ${urlInputs.nodeIds?.length || 0}`);
  
  // Check for form
  const forms = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'form' 
  });
  console.log(`Forms: ${forms.nodeIds?.length || 0}`);
  
  if (forms.nodeIds && forms.nodeIds.length > 0) {
    for (let i = 0; i < forms.nodeIds.length; i++) {
      const nodeId = forms.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML.substring(0, 500); }',
        returnByValue: true
      });
      console.log(`  Form ${i}: ${htmlResult.result?.value}`);
    }
  }
  
  ws.close();
}

main().catch(console.error);
