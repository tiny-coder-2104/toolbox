'use strict';
const fs = require('fs');
const path = require('path');
const { loadState, saveState } = require('./state');

const LOG_PATH = path.join(__dirname, '..', 'post-log.json');

function logPost(text, platform) {
  const now = new Date().toISOString();
  const entry = { timestamp: now, platform: platform || 'unknown', text: text.substring(0, 200) };
  let logs = [];
  if (fs.existsSync(LOG_PATH)) {
    try { logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); } catch(e) { logs = []; }
  }
  logs.push(entry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
  return entry;
}

function getPostStatus() { return loadState(); }

module.exports = { logPost, getPostStatus };
