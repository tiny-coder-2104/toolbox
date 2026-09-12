'use strict';
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.CDP_PORT || 9222;
const BASE = `http://127.0.0.1:${PORT}`;
let cmdId = 1;

if (require.main === module && process.argv.includes('--help')) {
  console.log('CDP primal. Functions: listTargets, openTab, evalInTab, clickByText, fillInput, setFileInput, screenshot, pageText');
  process.exit(0);
}

function listTargets() {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}/json/list`, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d))); }).on('error',reject);
  });
}

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function sendCmd(ws, method, params, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const id = cmdId++;
    const timer = setTimeout(() => { ws.removeListener('message', handler); reject(new Error('CDP timeout after ' + timeout + 'ms')); }, timeout);
    const handler = data => {
      const msg = JSON.parse(data);
      if (msg.id === id) { clearTimeout(timer); ws.removeListener('message', handler); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function openTab(wsUrl) {
  const ws = await wsConnect(wsUrl);
  await sendCmd(ws, 'DOM.enable');
  return ws;
}

async function evalInTab(wsUrl, expression) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  ws.close();
  return r.result || r;
}

async function withTab(wsUrl, fn) {
  const ws = await wsConnect(wsUrl);
  try {
    return await fn(ws);
  } finally {
    ws.close();
  }
}

async function clickByText(wsUrl, selectorItem, text) {
  const ws = await wsConnect(wsUrl);
  const expr = `(function(){var els=document.querySelectorAll(${JSON.stringify(selectorItem)});for(var i=0;i<els.length;i++){if(els[i].textContent.trim()===${JSON.stringify(text)}){els[i].click();return{ok:true,index:i}}}return{error:'not found'}})()`;
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
  ws.close();
  return r.result;
}

async function fillInput(wsUrl, { tag, index, value, useNativeSetter }) {
  const ws = await wsConnect(wsUrl);
  const sel = tag || 'input', idx = index || 0, val = JSON.stringify(value);
  const expr = useNativeSetter
    ? `(function(){var els=document.querySelectorAll('${sel}');if(!els[${idx}])return{error:'not found'};var e=els[${idx}];e.value=${val};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new Event('blur',{bubbles:true}));return{ok:true}})()`
    : `(function(){var els=document.querySelectorAll('${sel}');if(!els[${idx}])return{error:'not found'};var e=els[${idx}];e.value=${val};return{ok:true}})()`;
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
  ws.close();
  return r.result;
}

async function setFileInput(wsUrl, selector, filePath) {
  const ws = await wsConnect(wsUrl);
  await sendCmd(ws, 'DOM.enable');
  const doc = await sendCmd(ws, 'DOM.getDocument');
  const rootId = doc.root.nodeId;
  const q = await sendCmd(ws, 'DOM.querySelector', { nodeId: rootId, selector });
  await sendCmd(ws, 'DOM.setFileInputFiles', { nodeId: q.nodeId, files: [filePath] });
  ws.close();
  return { ok: true, nodeId: q.nodeId };
}

async function screenshot(wsUrl, outPath) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Page.captureScreenshot', { format: 'png' });
  ws.close();
  if (r?.data) {
    const fs = require('fs');
    const dir = require('path').dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(r.data, 'base64'));
  }
  return outPath;
}

async function pageText(wsUrl) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  ws.close();
  return r.result?.value || '';
}

module.exports = { listTargets, openTab, evalInTab, clickByText, fillInput, setFileInput, screenshot, pageText };
