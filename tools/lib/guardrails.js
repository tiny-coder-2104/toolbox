'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { MIN_HOURS } = require('./state');

const AGENT_STATE_PATH = path.join(__dirname, '..', '..', 'AGENT_STATE.md');

function checkKillSwitch() {
  if (!fs.existsSync(AGENT_STATE_PATH)) return false;
  return fs.readFileSync(AGENT_STATE_PATH, 'utf8').includes('KILL_SWITCH: ARMED');
}

function checkReadiness(platform) {
  try {
    const result = execSync(
      `node "${path.join(__dirname, '..', 'check-post-readiness.js')}" --platform "${platform}"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    return { ready: true, output: result.trim() };
  } catch (e) {
    return { ready: false, output: e.stdout ? e.stdout.trim() : e.message };
  }
}

module.exports = { checkKillSwitch, checkReadiness };
