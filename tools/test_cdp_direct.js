const cdp = require('./cdp');
const wsUrl = 'ws://127.0.0.1:9222/devtools/page/7AC0DB355B591C567F57DE6371CC93B7';
cdp.evalInTab(wsUrl, '1+1').then(r => console.log('Result:', JSON.stringify(r))).catch(e => console.log('Error:', e.message));
