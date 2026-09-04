#!/usr/bin/env python3
"""Capture the full value of a freshly generated Supabase access token from
the network response. Reloads the tokens page, drives the generate dialog,
and dumps the POST /v1/*/access-tokens response body to stdout + a file."""
import json
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from cdp import CDP, list_tabs

PORT = 9222
OUT = "/tmp/supabase-pat.json"
TOKEN_NAME = "tinycoder-cli-2"

def main():
    tabs = list_tabs(PORT)
    c = CDP(PORT, tabs[0]["id"])
    c.send("Network.enable")
    c.send("Page.enable")
    c.send("Page.reload")
    time.sleep(4)

    def js(expr):
        return c.evaluate(expr).get("value")

    # open dialog
    js("(function(){var b=[].slice.call(document.querySelectorAll('button')).find(e=>e.textContent.indexOf('Generate new token')>=0);if(b)b.click();return true})()")
    time.sleep(2)
    # fill name
    js("(function(){var d=document.querySelector('[role=dialog]');if(!d)return false;var inp=d.querySelector('input[placeholder*=\"name\"]');var s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'%s');inp.dispatchEvent(new Event('input',{bubbles:true}));return inp.value})()" % TOKEN_NAME)
    time.sleep(1)
    # submit
    js("(function(){var d=document.querySelector('[role=dialog]');var b=[].slice.call(d.querySelectorAll('button')).find(x=>x.textContent.trim()==='Generate token');if(b){b.click();return true}return false})()")
    time.sleep(3)

    # find the access-token request/response
    found = []
    for ev in c.events:
        if ev.get("method") == "Network.responseReceived":
            url = ev["params"]["response"]["url"]
            if "access-tokens" in url or "access_token" in url:
                rid = ev["params"]["requestId"]
                body = c.send("Network.getResponseBody", requestId=rid)
                found.append({"url": url, "body": body.get("result", {})})
    with open(OUT, "w") as f:
        json.dump(found, f, indent=2)
    print(json.dumps(found, indent=2, default=str))
    c.close()

if __name__ == "__main__":
    main()