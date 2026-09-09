'use strict';
const { loadState, saveState, MIN_HOURS } = require('./lib/state');

function fmtISO(d) { return d.toISOString(); }

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log('Usage: node check-post-readiness.js [--platform <name>] [--since <ISO>] [--show-state] [--yes]'); process.exit(0); }
  let platform, sinceStr, showState = false, doIt = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--platform' && args[i+1]) platform = args[++i];
    else if (args[i] === '--since' && args[i+1]) sinceStr = args[++i];
    else if (args[i] === '--show-state') showState = true;
    else if (args[i] === '--yes') doIt = true;
  }
  const state = loadState();
  if (showState) { console.log(JSON.stringify(state, null, 2)); process.exit(0); }
  if (!platform) { console.error('Error: --platform <name> required'); process.exit(1); }
  const since = sinceStr ? new Date(sinceStr) : (state.last_post ? new Date(state.last_post) : null);
  const now = new Date();
  if (since && !isNaN(since.getTime())) {
    const hoursSince = (now - since) / 36e5;
    if (hoursSince < MIN_HOURS) { console.log(`NOT READY: ${Math.ceil(MIN_HOURS - hoursSince)}h remaining since last post`); process.exit(1); }
  }
  if (doIt) { state.last_post = fmtISO(now); if (!state.platforms_posted.includes(platform)) state.platforms_posted.push(platform); saveState(state); }
  const hoursUntil = since && !isNaN(since.getTime()) ? Math.ceil(MIN_HOURS - (now - since) / 36e5) : 0;
  console.log(`READY${hoursUntil > 0 ? ` (min ${hoursUntil}h since last post)` : ''}`);
  process.exit(0);
}

if (require.main === module) main();
module.exports = { loadState, saveState, MIN_HOURS };
