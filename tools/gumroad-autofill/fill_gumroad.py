#!/usr/bin/env python3
"""CDP-based Gumroad product fill script.

Uses run.py eval to set fields. Avoids JS string escaping issues.
"""
import json
import sys
import os
import subprocess
import time

EXPECTED_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "suggestions.json")
RUN_PY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../browser/run.py")

with open(EXPECTED_PATH) as f:
    data = json.load(f)


def eval_js(expr):
    """Evaluate JS expression via run.py eval."""
    result = subprocess.run(
        ["python3", RUN_PY, "eval", expr, "--port", "9222"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15
    )
    try:
        res = json.loads(result.stdout.strip())
        if isinstance(res, dict) and "value" in res:
            return res["value"]
        return res
    except (json.JSONDecodeError, TypeError):
        return result.stdout.strip()


def set_field(label_text, value):
    """Find input by label text and set its value."""
    expr = (
        "(function(){"
        "var labels=document.querySelectorAll('label');"
        "for(var i=0;i<labels.length;i++){"
        "if(labels[i].textContent.trim()==='" + label_text + "'){"
        "var forId=labels[i].getAttribute('for');"
        "if(forId){"
        "var el=document.getElementById(forId);"
        "if(el){"
        "el.value=" + json.dumps(str(value)) + ";"
        "el.dispatchEvent(new Event('input',{bubbles:true}));"
        "el.dispatchEvent(new Event('change',{bubbles:true}));"
        "el.dispatchEvent(new Event('blur',{bubbles:true}));"
        "return 'SET:" + label_text + "';"
        "}}}"
        "}}"
        "return 'NOT_FOUND';"
        "})()"
    )
    return eval_js(expr)


def set_tiptap(html):
    """Set Tiptap editor content."""
    expr = (
        "(function(){"
        "var e=document.querySelector('div.tiptap[contenteditable=true]');"
        "if(!e)return 'TIPTAP_NOT_FOUND';"
        "e.innerHTML=" + json.dumps(html) + ";"
        "e.focus();"
        "e.dispatchEvent(new Event('input',{bubbles:true}));"
        "e.dispatchEvent(new Event('blur',{bubbles:true}));"
        "var form=e.closest('form');"
        "if(form)form.dispatchEvent(new Event('change',{bubbles:true}));"
        "return 'SET:description('+e.innerHTML.length+'chars)';"
        "})()"
    )
    return eval_js(expr)


def set_version_field(version_name, field_label, value):
    """Set a field within the Versions section."""
    expr = (
        "(function(){"
        "var sections=document.querySelectorAll('section');"
        "for(var s=0;s<sections.length;s++){"
        "if(sections[s].textContent.indexOf('Versions')!==-1){"
        "var labels=sections[s].querySelectorAll('label');"
        "for(var i=0;i<labels.length;i++){"
        "if(labels[i].textContent.trim()==='" + field_label + "'){"
        "var forId=labels[i].getAttribute('for');"
        "if(forId){"
        "var el=document.getElementById(forId);"
        "if(el){"
        "el.value=" + json.dumps(str(value)) + ";"
        "el.dispatchEvent(new Event('input',{bubbles:true}));"
        "el.dispatchEvent(new Event('change',{bubbles:true}));"
        "el.dispatchEvent(new Event('blur',{bubbles:true}));"
        "return 'SET:" + version_name + "." + field_label + "';"
        "}}}"
        "}}"
        "}}"
        "return 'NOT_FOUND';"
        "})()"
    )
    return eval_js(expr)


def click_save():
    """Click Save button specifically (not Unpublish)."""
    expr = (
        "(function(){"
        "var btns=Array.from(document.querySelectorAll('button'));"
        "for(var i=0;i<btns.length;i++){"
        "var t=btns[i].textContent.trim();"
        "if(/^save$/i.test(t)){btns[i].click();return 'clicked:Save';}"
        "}"
        "var b=document.querySelector('button[type=submit]');"
        "if(b){b.click();return 'clicked:type=submit';}"
        "return 'NOT_FOUND';"
        "})()"
    )
    return eval_js(expr)


# ── MAIN ──
print("=== Reading current values ===")
current_name = eval_js("document.querySelector('input[name=name]')?.value || 'NOT_FOUND'")
current_summary = eval_js("document.querySelector('input[name=summary]')?.value || 'NOT_FOUND'")
current_amount = eval_js("document.querySelector('input[name=amount]')?.value || 'NOT_FOUND'")
print(f"  Name: {str(current_name)[:50]}")
print(f"  Summary: {str(current_summary)[:50]}")
print(f"  Amount: {current_amount}")

print("\n=== Filling product fields ===")
print(f"  Name: {set_field('Name', data['title'])}")
print(f"  URL: {set_field('URL', data['url_slug'])}")
print(f"  Summary: {set_field('Summary', data['summary'])}")
print(f"  Call to Action: {set_field('Call to action', data['call_to_action'])}")
print(f"  Amount: {set_field('Amount', str(data['variants'][0]['price_cents']))}")
print(f"  Fine Print: {set_field('Fine print (optional)', data['fine_print'])}")
print(f"  Description: {set_tiptap(data['description_html'])}")

print("\n=== Filling variant fields ===")
for v in data["variants"]:
    print(f"  {v['name']} Name: {set_version_field(v['name'], 'Name', v['version_label'])}")
    print(f"  {v['name']} Desc: {set_version_field(v['name'], 'Description', v['description'])}")
    print(f"  {v['name']} Price: {set_version_field(v['name'], 'Additional amount', str(v['price_cents']))}")

print("\n=== Clicking Save ===")
save_result = click_save()
print(f"  Save: {save_result}")

print("\n=== Waiting 3s ===")
time.sleep(3)

print("\n=== Post-save verification ===")
fp_after = eval_js(
    "(function(){"
    "var labels=document.querySelectorAll('label');"
    "for(var i=0;i<labels.length;i++){"
    "if(labels[i].textContent.trim()==='Fine print (optional)'){"
    "var forId=labels[i].getAttribute('for');"
    "if(forId){var el=document.getElementById(forId);"
    "if(el)return el.value;}}}"
    "return 'NOT_FOUND';"
    "})()"
)
fp_ok = fp_after == data["fine_print"]
print(f"  Fine Print match: {'PASS' if fp_ok else 'FAIL'}")
print(f"  Actual fine_print: {str(fp_after)[:80]}")

# Save log
log = {
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    "tab": "TinyCoder Web Toolbox — 5 Essential Dev Tools Template",
    "before": {
        "name": str(current_name)[:80],
        "summary": str(current_summary)[:80],
        "amount": str(current_amount),
    },
    "after": {"fine_print_match": fp_ok, "fine_print_actual": str(fp_after)[:80]},
    "save_clicked": save_result != "NOT_FOUND",
    "save_result": str(save_result),
}
log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_push.json")
with open(log_path, "w") as f:
    json.dump(log, f, indent=2, default=str)
print(f"\nLog saved to {log_path}")
print(f"\nFinal: Fine Print={'PASS' if fp_ok else 'FAIL'}, Save={save_result}")
