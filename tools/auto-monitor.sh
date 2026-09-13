#!/bin/bash
# Auto-monitor cycle — runs every 2 hours
# Checks: site health, engagement, dev.to comments, Gumroad status
# Logs everything to metrics-log.jsonl

NODE=/home/yuki/.nvm/versions/node/v16.20.2/bin/node
TOOLS=/home/yuki/ai_works/tiny_coder/tools
LOG=/tmp/auto-monitor.log

echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] === AUTO MONITOR START ===" >> $LOG

# 1. Run observation (site + social)
$TOOLS/observe.sh >> $LOG 2>&1

# 2. Check dev.to comments specifically
export DEVTO_API_KEY="$(sed -n '2p' /home/yuki/ai_works/pseudo_human/cookies/api_key.md)"

echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] Checking dev.to comments..." >> $LOG

# Article 1 comments
ART1_COMMENTS=$(curl -s "https://dev.to/api/articles/4615810" -H "api-key: $DEVTO_API_KEY" -H "User-Agent: pseudo-human-poster/1.0" | $NODE -e "const c=[];process.stdin.on('data',d=>c.push(d));process.stdin.on('end',()=>{const d=JSON.parse(Buffer.concat(c));console.log(d.comments_count)})" 2>/dev/null)

# Article 2 comments
ART2_COMMENTS=$(curl -s "https://dev.to/api/articles/4618264" -H "api-key: $DEVTO_API_KEY" -H "User-Agent: pseudo-human-poster/1.0" | $NODE -e "const c=[];process.stdin.on('data',d=>c.push(d));process.stdin.on('end',()=>{const d=JSON.parse(Buffer.concat(c));console.log(d.comments_count)})" 2>/dev/null)

echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] Article 1 comments: $ART1_COMMENTS | Article 2 comments: $ART2_COMMENTS" >> $LOG

# 3. Log the metrics
$NODE -e "
const { logMetric } = require('$TOOLS/lib/metrics');
logMetric('auto-monitor', {
  timestamp: new Date().toISOString(),
  article1_comments: $ART1_COMMENTS,
  article2_comments: $ART2_COMMENTS,
  cycle: '2h-auto'
});
console.log('Metrics logged');
" >> $LOG 2>&1

# 4. Check if there are NEW comments (compare with last known)
# This is a simple check — if comments increased, note it
LAST_ART1=0
LAST_ART2=0
if [ -f /tmp/last-comment-counts.json ]; then
  LAST_ART1=$($NODE -e "const d=require('/tmp/last-comment-counts.json');console.log(d.art1||0)")
  LAST_ART2=$($NODE -e "const d=require('/tmp/last-comment-counts.json');console.log(d.art2||0)")
fi

if [ "$ART1_COMMENTS" -gt "$LAST_ART1" ] 2>/dev/null; then
  echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] *** NEW COMMENT ON ARTICLE 1 ***" >> $LOG
fi

if [ "$ART2_COMMENTS" -gt "$LAST_ART2" ] 2>/dev/null; then
  echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] *** NEW COMMENT ON ARTICLE 2 ***" >> $LOG
fi

# Save current counts for next check
$NODE -e "require('fs').writeFileSync('/tmp/last-comment-counts.json', JSON.stringify({art1: $ART1_COMMENTS, art2: $ART2_COMMENTS}))" 2>/dev/null

echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] === AUTO MONITOR END ===" >> $LOG
