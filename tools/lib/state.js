'use strict';
const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', 'post-schedule.json');
const MIN_HOURS = 48;

function loadState() {
  if (!fs.existsSync(STATE_PATH)) fs.writeFileSync(STATE_PATH, JSON.stringify({last_post: null, platforms_posted: []}, null, 2));
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) { fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2)); }

module.exports = { STATE_PATH, MIN_HOURS, loadState, saveState };
