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
  
  // Search for any element with "Post" in class, id, data-testid, etc.
  const postElements = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '[class*="post" i], [id*="post" i], [data-testid*="post" i], [aria-label*="post" i]' 
  });
  console.log(`Post-related elements: ${postElements.nodeIds?.length || 0}`);
  
  if (postElements.nodeIds && postElements.nodeIds.length > 0) {
    for (let i = 0; i < Math.min(postElements.nodeIds.length, 20); i++) {
      const nodeId = postElements.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML.substring(0, 300); }',
        returnByValue: true
      });
      console.log(`  Element ${i}: ${htmlResult.result?.value}`);
    }
  }
  
  // Check the reCAPTCHA token input
  const recaptchaInput = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'input[name="recaptchaToken"]' 
  });
  console.log(`\nreCAPTCHA inputs: ${recaptchaInput.nodeIds?.length || 0}`);
  
  if (recaptchaInput.nodeIds && recaptchaInput.nodeIds.length > 0) {
    const nodeId = recaptchaInput.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    const valResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
      objectId: objId,
      functionDeclaration: 'function() { return this.value; }',
      returnByValue: true
    });
    console.log('reCAPTCHA token value:', valResult.result?.value);
  }
  
  // Check if there's a submit button on the form
  const formSubmit = await sendCmd(ws, 'Runtime.evaluate', {
    expression: `
      (function() {
        const form = document.querySelector('r-post-composer-form');
        if (!form) return 'no form';
        
        // Check for submit button in shadow DOM
        if (form.shadowRoot) {
          const submitBtn = form.shadowRoot.querySelector('button[type="submit"], [type="submit"]');
          if (submitBtn) return 'submit in shadow: ' + submitBtn.textContent.trim();
        }
        
        // Check for any button with post/submit text
        const allButtons = form.querySelectorAll('button, [role="button"]');
        for (let btn of allButtons) {
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('post') || text.includes('submit')) {
            return 'found in light: ' + btn.textContent.trim();
          }
        }
        
        return 'no submit button found';
      })()
    `,
    returnByValue: true
  });
  console.log('\nForm submit check:', formSubmit.result?.value);
  
  ws.close();
}

main().catch(console.error);
