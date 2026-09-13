'use strict';
const fs = require('fs');
const path = require('path');

const METRICS_PATH = path.join(__dirname, '..', 'metrics-log.jsonl');

function logMetric(type, data) {
  const entry = { timestamp: new Date().toISOString(), type, data };
  fs.appendFileSync(METRICS_PATH, JSON.stringify(entry) + '\n');
  return entry;
}

function readMetrics(lastN) {
  if (!fs.existsSync(METRICS_PATH)) return [];
  const lines = fs.readFileSync(METRICS_PATH, 'utf8').trim().split('\n').filter(Boolean);
  const entries = lines.map(l => JSON.parse(l));
  return lastN ? entries.slice(-lastN) : entries;
}

module.exports = { logMetric, readMetrics, METRICS_PATH };
