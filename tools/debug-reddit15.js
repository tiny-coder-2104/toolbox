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
  
  // Find the faceplate-textarea-input for link and try to set its value via JavaScript
  const result = await sendCmd(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const fp = document.querySelector('faceplate-textarea-input[name="link"]');
        if (!fp) return 'faceplate not found';
        
        // Try to find input in shadow DOM
        let input = null;
        if (fp.shadowRoot) {
          input = fp.shadowRoot.querySelector('input, textarea');
        }
        if (!input) {
          input = fp.querySelector('input, textarea');
        }
        if (!input) {
          // Try to find any focusable element
          input = fp.shadowRoot?.querySelector('[contenteditable], [tabindex]') || fp.querySelector('[contenteditable], [tabindex]');
        }
        
        if (input) {
          input.focus();
          input.value = 'https://github.com/tiny-coder-2104/json-validator-cli';
          input.dispatchEvent(new Event('input', {bubbles: true}));
          input.dispatchEvent(new Event('change', {bubbles: true}));
          return 'filled: ' + input.tagName;
        }
        
        // Try setting value on the faceplate component directly
        if (fp.value !== undefined) {
          fp.value = 'https://github.com/tiny-coder-2104/json-validator-cli';
          fp.dispatchEvent(new Event('input', {bubbles: true}));
          return 'filled via component value';
        }
        
        return 'no input found';
      })()
    `,
    returnByValue: true
  });
  console.log('Link fill result:', result.result?.value);
  
  // Wait
  await new Promise(r => setTimeout(r, 1000));
  
  // Check for Post button
  const allButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button, [role="button"]' 
  });
  console.log(`\nAll buttons: ${allButtons.nodeIds?.length || 0}`);
  
  if (allButtons.nodeIds && allButtons.nodeIds.length > 0) {
    for (let i = 0; i < allButtons.nodeIds.length; i++) {
      const nodeId = allButtons.nodeIds[i];
      const btnResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const btnObjId = btnResult.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: btnObjId,
        functionDeclaration: 'function() { return this.textContent.trim(); }',
        returnByValue: true
      });
      const text = textResult.result?.value || '';
      if (text.toLowerCase().includes('post') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('publish') || text.toLowerCase().includes('next')) {
        console.log(`  Button ${i}: "${text}"`);
      }
    }
  }
  
  ws.close();
}

main().catch(console.error);
