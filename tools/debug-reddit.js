'use strict';
const http = require('http');
const WebSocket = require('ws');

const PORT = 9222;
const BASE = `http://127.0.0.1:${PORT}`;
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
  
  // Enable DOM
  await sendCmd(ws, 'DOM.enable');
  console.log('DOM enabled');
  
  // Get document
  const doc = await sendCmd(ws, 'DOM.getDocument');
  console.log('Document:', doc.root.nodeId);
  
  // Find all buttons
  const buttons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button' 
  });
  console.log('Buttons found:', buttons.nodeIds?.length || 0);
  
  // Get button texts
  if (buttons.nodeIds && buttons.nodeIds.length > 0) {
    for (let i = 0; i < Math.min(buttons.nodeIds.length, 10); i++) {
      const nodeId = buttons.nodeIds[i];
      const box = await sendCmd(ws, 'DOM.getBoxModel', { nodeId });
      const text = await sendCmd(ws, 'DOM.getOuterHTML', { nodeId });
      console.log(`Button ${i}:`, text.outerHTML?.substring(0, 200));
    }
  }
  
  // Find inputs
  const inputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'input' 
  });
  console.log('Inputs found:', inputs.nodeIds?.length || 0);
  
  if (inputs.nodeIds && inputs.nodeIds.length > 0) {
    for (let i = 0; i < Math.min(inputs.nodeIds.length, 10); i++) {
      const nodeId = inputs.nodeIds[i];
      const attrs = await sendCmd(ws, 'DOM.getAttributes', { nodeId });
      console.log(`Input ${i} attrs:`, attrs.attributes);
    }
  }
  
  ws.close();
}

main().catch(console.error);
