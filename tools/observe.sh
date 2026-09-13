#!/usr/bin/env bash
# observe.sh — Full observation cycle for Pseudo-Human adaptive intelligence
# Runs analytics + engagement checks, logs metrics, generates summary + daily report.
set -e

# ── Environment ──────────────────────────────────────────────────
NODE=/home/yuki/.nvm/versions/node/v16.20.2/bin/node
TOOLS=/home/yuki/ai_works/tiny_coder/tools
export BSKY_HANDLE=tinycoders2026.bsky.social
export BSKY_APP_PASSWORD=$(sed -n "5p" /home/yuki/ai_works/pseudo_human/cookies/api_key.md)
export DEVTO_API_KEY=$(sed -n "2p" /home/yuki/ai_works/pseudo_human/cookies/api_key.md)

MEMORY_DIR=/home/yuki/ai_works/pseudo_human/MEMORY
TODAY=$(date -u +"%Y-%m-%d")
NOW=$(date -u +"%Y-%m-%d %H:%M UTC")

# Temp files
ANALYTICS_JSON=$(mktemp)
BLUESKY_JSON=$(mktemp)
DEVTO_JSON=$(mktemp)

cleanup() { rm -f "$ANALYTICS_JSON" "$BLUESKY_JSON" "$DEVTO_JSON"; }
trap cleanup EXIT

# ── 1. Site Health ───────────────────────────────────────────────
$NODE $TOOLS/analytics-check.js > "$ANALYTICS_JSON" 2>/dev/null || true
SITE_STATUS=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$ANALYTICS_JSON','utf8')); console.log(d.status||0)" 2>/dev/null || echo "0")
SITE_MS=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$ANALYTICS_JSON','utf8')); console.log(d.responseTimeMs||0)" 2>/dev/null || echo "0")
SITE_LIVE=$([ "$SITE_STATUS" -ge 200 ] && [ "$SITE_STATUS" -lt 400 ] && echo "OK" || echo "DOWN")

# ── 2. Bluesky Engagement ────────────────────────────────────────
$NODE $TOOLS/engagement-check.js --platform bluesky > "$BLUESKY_JSON" 2>/dev/null || true
BS_LIKES=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$BLUESKY_JSON','utf8')); console.log((d.engagement&&d.engagement.likes)||0)" 2>/dev/null || echo "0")
BS_REPOSTS=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$BLUESKY_JSON','utf8')); console.log((d.engagement&&d.engagement.reposts)||0)" 2>/dev/null || echo "0")
BS_COMMENTS=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$BLUESKY_JSON','utf8')); console.log((d.engagement&&d.engagement.comments)||0)" 2>/dev/null || echo "0")

# ── 3. dev.to Engagement ─────────────────────────────────────────
$NODE $TOOLS/engagement-check.js --platform devto > "$DEVTO_JSON" 2>/dev/null || true
DT_LIKES=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$DEVTO_JSON','utf8')); console.log((d.engagement&&d.engagement.likes)||0)" 2>/dev/null || echo "0")
DT_COMMENTS=$($NODE -e "const d=JSON.parse(require('fs').readFileSync('$DEVTO_JSON','utf8')); console.log((d.engagement&&d.engagement.comments)||0)" 2>/dev/null || echo "0")

# ── 4. Twitter (CDP — needs manual check) ────────────────────────
TWITTER_STATUS="needs CDP"

# ── 5. Summary ───────────────────────────────────────────────────
COMMENT_NOTE=$([ "$DT_COMMENTS" -gt 0 ] && echo " ($DT_COMMENTS comment!)" || "")
SUMMARY="[$NOW] Site: $SITE_LIVE (${SITE_MS}ms) | Bluesky: $BS_LIKES/$BS_REPOSTS/$BS_COMMENTS | dev.to: $DT_LIKES/$DT_COMMENTS$COMMENT_NOTE | Twitter: $TWITTER_STATUS"
echo "$SUMMARY"

# ── 6. Write Observation Report ──────────────────────────────────
REPORT_FILE="$MEMORY_DIR/$TODAY.md"
cat >> "$REPORT_FILE" <<EOF

## Observation — $NOW
| Metric | Value |
|--------|-------|
| Site | ${SITE_STATUS} OK, ${SITE_MS}ms |
| Bluesky | ${BS_LIKES} likes, ${BS_REPOSTS} reposts, ${BS_COMMENTS} comments |
| dev.to | ${DT_LIKES} likes, ${DT_COMMENTS} comment |
| Twitter | $TWITTER_STATUS |
EOF

echo "── Report appended to $REPORT_FILE" >&2
