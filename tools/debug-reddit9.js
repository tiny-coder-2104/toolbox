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
  
  // Find the link shell button (Add Link)
  const linkShell = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '#post-composer_link-shell button' 
  });
  console.log(`Link shell buttons: ${linkShell.nodeIds?.length || 0}`);
  
  if (linkShell.nodeIds && linkShell.nodeIds.length > 0) {
    for (let i = 0; i < linkShell.nodeIds.length; i++) {
      const nodeId = linkShell.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.textContent.trim(); }',
        returnByValue: true
      });
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML; }',
        returnByValue: true
      });
      console.log(`  Link button ${i}: "${textResult.result?.value}"`);
      console.log(`  HTML: ${htmlResult.result?.value?.substring(0, 300)}`);
    }
  }
  
  // Find the post submit button
  const submitButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '#post-submit-form button[type="submit"], #post-submit-form [role="button"]' 
  });
  console.log(`\nSubmit buttons: ${submitButtons.nodeIds?.length || 0}`);
  
  if (submitButtons.nodeIds && submitButtons.nodeIds.length > 0) {
    for (let i = 0; i < submitButtons.nodeIds.length; i++) {
      const nodeId = submitButtons.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const textResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.textContent.trim(); }',
        returnByValue: true
      });
      console.log(`  Submit button ${i}: "${textResult.result?.value}"`);
    }
  }
  
  // Find the title input (post-composer-title)
  const titleInput = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'post-composer-title' 
  });
  console.log(`\nTitle components: ${titleInput.nodeIds?.length || 0}`);
  
  if (titleInput.nodeIds && titleInput.nodeIds.length > 0) {
    const nodeId = titleInput.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
      objectId: objId,
      functionDeclaration: 'function() { return this.outerHTML; }',
      returnByValue: true
    });
    console.log(`Title component HTML:`, htmlResult.result?.value?.substring(0, 500));
  }
  
  // Find the link input inside link shell
  const linkInput = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '#post-composer_link-shell input, #post-composer_link-shell [contenteditable]' 
  });
  console.log(`\nLink inputs: ${linkInput.nodeIds?.length || 0}`);
  
  if (linkInput.nodeIds && linkInput.nodeIds.length > 0) {
    for (let i = 0; i < linkInput.nodeIds.length; i++) {
      const nodeId = linkInput.nodeIds[i];
      const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
      const objId = result.object.objectId;
      const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
        objectId: objId,
        functionDeclaration: 'function() { return this.outerHTML; }',
        returnByValue: true
      });
      console.log(`Link input ${i}:`, htmlResult.result?.value?.substring(0, 300));
    }
  }
  
  ws.close();
}

main().catch(console.error);
