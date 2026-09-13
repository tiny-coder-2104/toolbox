'use strict';
const http = require('http');
const WebSocket = require('ws');

const PORT = 9222;
const BASE = `http://127.0.0.1:${PORT}`;

function listTargets() {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}/json/list`, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d))); }).on('error',reject);
  });
}

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => { console.log('OPEN'); resolve(ws); });
    ws.on('error', reject);
  });
}

function sendCmd(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + Math.floor(Math.random() * 1e6);
    const handler = data => {
      const msg = JSON.parse(data);
      console.log('HANDLER msg.id=' + msg.id + ' expected=' + id);
      if (msg.id === id) { 
        console.log('MATCH');
        ws.off('message', handler); 
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); 
      }
    };
    ws.on('message', handler);
    console.log('SENDING id=' + id);
    ws.send(JSON.stringify({ id, method, params }));
    console.log('SENT');
  });
}

async function evalInTab(wsUrl, expression) {
  console.log('Connecting...');
  const ws = await wsConnect(wsUrl);
  console.log('Connected, calling sendCmd');
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  ws.close();
  return r.result || r;
}

(async () => {
  const targets = await listTargets();
  const twitter = targets.find(t => t.url && t.url.includes('x.com'));
  const wsUrl = twitter.webSocketDebuggerUrl;
  console.log('wsUrl:', wsUrl);
  const r = await evalInTab(wsUrl, '1+1');
  console.log('Result:', JSON.stringify(r));
})();
