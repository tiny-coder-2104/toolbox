#!/usr/bin/env python3
"""CDP browser control CLI.
Usage: run.py tabs | goto <url> | eval <expr> | text | shot [path] | click <selector>
"""
import argparse
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from cdp import CDP, list_tabs

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd")
    ap.add_argument("arg", nargs="?", default=None)
    ap.add_argument("--port", type=int, default=9222)
    args = ap.parse_args()

    if args.cmd == "tabs":
        tabs = list_tabs(args.port)
        if not tabs:
            print("no page tabs")
            return
        for i, t in enumerate(tabs):
            print("%d) pid=%s\n   %s\n   %s" % (
                i, t.get("id", ""), t.get("title", "")[:80], t.get("url", "")))
        sys.exit(0)

    tabs = list_tabs(args.port)
    if not tabs:
        print("no page tabs to attach to", file=sys.stderr)
        sys.exit(1)
    target = tabs[0]["id"]

    if args.cmd == "goto":
        c = CDP(args.port, target)
        c.send("Page.enable")
        c.send("Page.navigate", url=args.arg)
        time.sleep(3)
        c.close()
        print("navigated to", args.arg)
    elif args.cmd == "eval":
        c = CDP(args.port, target)
        res = c.evaluate(args.arg)
        print(json.dumps(res, indent=2, default=str))
        c.close()
    elif args.cmd == "text":
        c = CDP(args.port, target)
        res = c.evaluate("document.body.innerText")
        val = res.get("value")
        if isinstance(val, str):
            print(val)
        else:
            print(json.dumps(res, indent=2, default=str))
        c.close()
    elif args.cmd == "shot":
        c = CDP(args.port, target)
        path = c.shot(args.arg or "/tmp/shot.png")
        c.close()
        print(path)
    elif args.cmd == "click":
        c = CDP(args.port, target)
        sel = json.dumps(args.arg)
        res = c.evaluate("(function(){var el=document.querySelector(%s);if(!el)return {error:'not found: '+%s};el.click();return {ok:true};})()" % (sel, sel))
        print(json.dumps(res, indent=2, default=str))
        c.close()
    else:
        ap.error("unknown cmd: %s" % args.cmd)

if __name__ == "__main__":
    main()