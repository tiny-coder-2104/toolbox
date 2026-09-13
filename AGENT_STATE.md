# AGENT_STATE — Kill Switch Registry

## KILL_SWITCH: NOT ARMED

This file tracks the kill switch state for the TinyCoder agent system.

### Status: SAFE
- **Date:** 2026-09-08
- **State:** NOT ARMED
- **Note:** All tools operate in dry-run mode by default. `--yes` flag required for any mutating action.

### Guardrail Rules
1. No tool auto-posts or deploys without explicit `--yes` CLI flag
2. `tools/gumroad-upload.js` — dry-run default, `--yes` to set file input
3. `tools/chatbase-kb.js` — dry-run default, `--yes` to update KB and retrain
4. `tools/vercel-status.js` — read-only, no `--yes` needed
5. `tools/verify-links.js` — read-only, no `--yes` needed
6. `tools/cdp.js` — library only, no mutating actions

### Armed-Stop Condition
If the switch is armed (Status line above reads ARMED), all tools must halt immediately and no `--yes` flag should be honored.
