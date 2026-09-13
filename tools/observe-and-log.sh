#!/usr/bin/env bash
# observe-and-log.sh — Wrapper that runs observe.sh and appends output to log
LOG=/tmp/observe.log
/home/yuki/ai_works/tiny_coder/tools/observe.sh 2>&1 | tee -a "$LOG"
