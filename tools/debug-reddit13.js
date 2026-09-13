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
  
  // Find the link input (faceplate-textarea-input with name="link")
  const linkInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'faceplate-textarea-input[name="link"]' 
  });
  console.log(`Link inputs: ${linkInputs.nodeIds?.length || 0}`);
  
  if (linkInputs.nodeIds && linkInputs.nodeIds.length > 0) {
    const nodeId = linkInputs.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Find the actual input/textarea inside
    const innerInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: nodeId, 
      selector: 'input, textarea, [contenteditable]' 
    });
    console.log(`Inner inputs: ${innerInputs.nodeIds?.length || 0}`);
    
    if (innerInputs.nodeIds && innerInputs.nodeIds.length > 0) {
      for (let i = 0; i < innerInputs.nodeIds.length; i++) {
        const innerNodeId = innerInputs.nodeIds[i];
        const innerResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: innerNodeId });
        const innerObjId = innerResult.object.objectId;
        const htmlResult = await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: innerObjId,
          functionDeclaration: 'function() { return this.outerHTML; }',
          returnByValue: true
        });
        console.log(`  Inner input ${i}: ${htmlResult.result?.value?.substring(0, 300)}`);
      }
    }
  }
  
  // Find the title contenteditable (slot="editor")
  const titleEditables = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: '[slot="editor"][contenteditable="true"]' 
  });
  console.log(`\nTitle editables: ${titleEditables.nodeIds?.length || 0}`);
  
  if (titleEditables.nodeIds && titleEditables.nodeIds.length > 0) {
    const nodeId = titleEditables.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Fill title
    await sendCmd(ws, 'Runtime.callFunctionOn', {
      objectId: objId,
      functionDeclaration: 'function(text) { this.focus(); this.textContent = text; this.dispatchEvent(new Event("input", {bubbles: true})); }',
      arguments: [{ value: 'Built a JSON Validator CLI in 100 Lines of Node.js — zero dependencies' }],
      returnByValue: true
    });
    console.log('Title filled');
  }
  
  // Find the link input and fill it
  const linkInputWrappers = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'r-post-url-input-wrapper' 
  });
  console.log(`\nLink input wrappers: ${linkInputWrappers.nodeIds?.length || 0}`);
  
  if (linkInputWrappers.nodeIds && linkInputWrappers.nodeIds.length > 0) {
    const nodeId = linkInputWrappers.nodeIds[0];
    const result = await sendCmd(ws, 'DOM.resolveNode', { nodeId });
    const objId = result.object.objectId;
    
    // Find the faceplate-textarea-input inside
    const faceplateInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
      nodeId: nodeId, 
      selector: 'faceplate-textarea-input' 
    });
    console.log(`Faceplate inputs in wrapper: ${faceplateInputs.nodeIds?.length || 0}`);
    
    if (faceplateInputs.nodeIds && faceplateInputs.nodeIds.length > 0) {
      const fpNodeId = faceplateInputs.nodeIds[0];
      const fpResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: fpNodeId });
      const fpObjId = fpResult.object.objectId;
      
      // Find the actual input inside faceplate-textarea-input
      const innerInputs = await sendCmd(ws, 'DOM.querySelectorAll', { 
        nodeId: fpNodeId, 
        selector: 'input, textarea' 
      });
      console.log(`Inner inputs in faceplate: ${innerInputs.nodeIds?.length || 0}`);
      
      if (innerInputs.nodeIds && innerInputs.nodeIds.length > 0) {
        const innerNodeId = innerInputs.nodeIds[0];
        const innerResult = await sendCmd(ws, 'DOM.resolveNode', { nodeId: innerNodeId });
        const innerObjId = innerResult.object.objectId;
        
        // Fill the URL
        await sendCmd(ws, 'Runtime.callFunctionOn', {
          objectId: innerObjId,
          functionDeclaration: 'function(url) { this.focus(); this.value = url; this.dispatchEvent(new Event("input", {bubbles: true})); this.dispatchEvent(new Event("change", {bubbles: true})); }',
          arguments: [{ value: 'https://github.com/tiny-coder-2104/json-validator-cli' }],
          returnByValue: true
        });
        console.log('Link URL filled');
      }
    }
  }
  
  // Wait and check for Post button
  await new Promise(r => setTimeout(r, 2000));
  
  // Search for any button with "Post" text
  const allButtons = await sendCmd(ws, 'DOM.querySelectorAll', { 
    nodeId: doc.root.nodeId, 
    selector: 'button, [role="button"]' 
  });
  console.log(`\nAll buttons after fill: ${allButtons.nodeIds?.length || 0}`);
  
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
      if (text.toLowerCase().includes('post') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('publish')) {
        console.log(`  Button ${i}: "${text}" <- POTENTIAL POST BUTTON`);
      }
    }
  }
  
  ws.close();
}

main().catch(console.error);
