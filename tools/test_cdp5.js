'use strict';
const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/7AC0DB355B591C567F57DE6371CC93B7';

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function sendCmd(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + Math.floor(Math.random() * 1e6);
    const handler = data => {
      const msg = JSON.parse(data);
      if (msg.id === id) { ws.off('message', handler); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInTab(wsUrl, expression) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  ws.close();
  return r.result || r;
}

(async () => {
  const r = await evalInTab(wsUrl, '1+1');
  console.log('Result:', JSON.stringify(r));
})();
