#!/usr/bin/env python3
"""Visual inspector for Gumroad product fields.

Primary: DOM readback via CDP — reads input values + Tiptap innerHTML,
compares to suggestions.json, prints PASS/FAIL per field.
Secondary: screenshot + OCR fallback (only if tesseract is available).

Usage:
    python3 visual_inspect.py --port 9222 --expected suggestions.json
    python3 visual_inspect.py --port 9222 --expected suggestions.json --dry
    python3 visual_inspect.py --port 9222 --expected suggestions.json --ocr
"""
import argparse
import json
import subprocess
import sys
import os
import shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/../browser")
from cdp import CDP, list_tabs


def load_expected(path):
    with open(path) as f:
        return json.load(f)


def find_tab(port, query="gumroad"):
    """Find a tab whose title or URL contains query."""
    tabs = list_tabs(port)
    for t in tabs:
        title = t.get("title", "")
        url = t.get("url", "")
        if query.lower() in title.lower() or query.lower() in url.lower():
            return t
    return None


def get_labels(port, target_id):
    """Read all label texts from the page."""
    c = CDP(port, target_id)
    res = c.evaluate(
        "Array.from(document.querySelectorAll('label')).map(l=>l.textContent.trim()).filter(Boolean)"
    )
    c.close()
    if isinstance(res, dict) and "error" in res:
        return []
    return res.get("value", []) if isinstance(res, dict) else []


def read_field(port, target_id, label_text):
    """Read the value of a field by its label text."""
    c = CDP(port, target_id)
    expr = (
        "(function(){"
        "var labels=document.querySelectorAll('label');"
        "for(var i=0;i<labels.length;i++){"
        "if(labels[i].textContent.trim()===%s){"
        "var forId=labels[i].getAttribute('for');"
        "if(forId){var el=document.getElementById(forId);"
        "if(el)return el.value||'(no value)';}"
        "}}return 'NOT_FOUND';"
        "})()" % json.dumps(label_text)
    )
    res = c.evaluate(expr)
    c.close()
    if isinstance(res, dict) and "error" in res:
        return "ERROR"
    return res.get("value", str(res)) if isinstance(res, dict) else str(res)


def read_tiptap(port, target_id):
    """Read Tiptap innerHTML length and content snippet."""
    c = CDP(port, target_id)
    expr = (
        "(function(){"
        "var e=document.querySelector('div.tiptap[contenteditable=true]');"
        "if(!e)return JSON.stringify({found:false});"
        "return JSON.stringify({found:true,length:e.innerHTML.length,snippet:e.innerHTML.slice(0,80)});"
        "})()"
    )
    res = c.evaluate(expr)
    c.close()
    if isinstance(res, dict) and "error" in res:
        return {"found": False}
    return res.get("value", {}) if isinstance(res, dict) else {}


def read_save_button(port, target_id):
    """Check if a Save/Publish button exists."""
    c = CDP(port, target_id)
    expr = (
        "(function(){"
        "var btns=Array.from(document.querySelectorAll('button'));"
        "var found=btns.find(b=>/save|publish|update/i.test(b.textContent));"
        "return found?found.textContent.trim():'NOT_FOUND';"
        "})()"
    )
    res = c.evaluate(expr)
    c.close()
    if isinstance(res, dict) and "error" in res:
        return "ERROR"
    return res.get("value", str(res)) if isinstance(res, dict) else str(res)


def click_save(port, target_id):
    """Try multiple fallbacks to click Save/Publish."""
    c = CDP(port, target_id)
    # Try 1: button[type="submit"]
    expr = (
        "(function(){"
        "var b=document.querySelector('button[type=submit]');"
        "if(b){b.click();return 'type=submit';}"
        "var b2=Array.from(document.querySelectorAll('button')).find(b=>/save|publish|update/i.test(b.textContent));"
        "if(b2){b2.click();return 'text-match: '+b2.textContent.trim();}"
        "return 'NOT_FOUND';"
        "})()"
    )
    res = c.evaluate(expr)
    c.close()
    if isinstance(res, dict) and "error" in res:
        return "ERROR"
    return res.get("value", str(res)) if isinstance(res, dict) else str(res)


def ocr_screenshot(port, target_id, path="/tmp/gumroad_after.png"):
    """Take a screenshot via CDP and optionally OCR it."""
    c = CDP(port, target_id)
    path = c.shot(path)
    c.close()
    if shutil.which("tesseract"):
        result = subprocess.run(
            ["tesseract", path, "stdout"], capture_output=True, text=True, timeout=30
        )
        return path, result.stdout[:500]
    return path, None


def truncate(s, n=60):
    s = str(s)
    return s if len(s) <= n else s[:n] + "..."


def main():
    ap = argparse.ArgumentParser(description="Visual inspector for Gumroad product fields")
    ap.add_argument("--port", type=int, default=9222, help="CDP port")
    ap.add_argument("--expected", default=None, help="Path to suggestions.json")
    ap.add_argument("--dry", action="store_true", help="Dry run without CDP")
    ap.add_argument("--ocr", action="store_true", help="Also run OCR screenshot check")
    args = ap.parse_args()

    expected_path = args.expected or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "suggestions.json"
    )
    data = load_expected(expected_path)

    if args.dry:
        print("=== DRY RUN ===")
        print(f"Expected fine_print: {truncate(data['fine_print'])}")
        print(f"Expected ROI phrase: {truncate('your margin grows' if 'your margin grows' in data['description_html'] else 'NEXT CLIENT IS PURE MARGIN')}")
        print(f"Expected title: {truncate(data['title'])}")
        print(f"Expected summary: {truncate(data['summary'])}")
        print(f"Expected variants: {[v['name'] for v in data['variants']]}")
        print("No CDP connection. Use --port to connect.")
        sys.exit(0)

    # Find Gumroad tab
    tab = find_tab(args.port)
    if not tab:
        print("⚠️  No Gumroad tab found on port", args.port)
        print("Fallback: generating manual-fill checklist")
        checklist = [
            f"1. Set Product Name → {data['title']}",
            f"2. Set URL Slug → {data['url_slug']}",
            f"3. Set Summary → {truncate(data['summary'])}",
            f"4. Set Description (Tiptap) → {len(data['description_html'])} chars",
            f"5. Set Fine Print → {truncate(data['fine_print'])}",
            f"6. Set Variant prices → {[v['price_display'] for v in data['variants']]}",
            f"7. Set Variant descriptions → {len(data['variants'])} variants",
            f"8. Upload cover image → MANUAL ({data['cover_brief'][:60]}...)",
        ]
        print("\n".join(checklist))
        sys.exit(0)

    target_id = tab["id"]
    print(f"✓ Found Gumroad tab: {tab['title'][:60]}")

    # Read current labels
    labels = get_labels(args.port, target_id)
    print(f"\nPage labels ({len(labels)}):")
    for l in labels[:20]:
        print(f"  - {l}")

    # Build comparison table
    print(f"\n{'Field':<20} {'Expected':<60} {'Actual':<60} {'Status'}")
    print("-" * 160)

    results = []

    # Product Name
    actual_name = read_field(args.port, target_id, "Name")
    name_match = actual_name == data["title"]
    print(f"{'Product Name':<20} {truncate(data['title'],55):<60} {truncate(actual_name,55):<60} {'PASS' if name_match else 'FAIL'}")
    results.append(("Product Name", name_match))

    # Summary
    actual_summary = read_field(args.port, target_id, "Summary")
    summary_match = actual_summary == data["summary"]
    print(f"{'Summary':<20} {truncate(data['summary'],55):<60} {truncate(actual_summary,55):<60} {'PASS' if summary_match else 'FAIL'}")
    results.append(("Summary", summary_match))

    # Fine Print
    actual_fp = read_field(args.port, target_id, "Fine print")
    fp_match = actual_fp == data["fine_print"]
    print(f"{'Fine Print':<20} {truncate(data['fine_print'],55):<60} {truncate(actual_fp,55):<60} {'PASS' if fp_match else 'FAIL'}")
    results.append(("Fine Print", fp_match))

    # Tiptap description
    tiptap = read_tiptap(args.port, target_id)
    if isinstance(tiptap, dict) and tiptap.get("found"):
        desc_match = len(tiptap.get("snippet", "")) > 0
        print(f"{'Description (Tiptap)':<20} {truncate(data['description_html'],55):<60} {truncate(tiptap.get('snippet',''),55):<60} {'PASS' if desc_match else 'FAIL'}")
        results.append(("Description (Tiptap)", desc_match))
    else:
        print(f"{'Description (Tiptap)':<20} {truncate(data['description_html'],55):<60} {'NOT_FOUND':<60} {'FAIL'}")
        results.append(("Description (Tiptap)", False))

    # Variant prices
    for v in data["variants"]:
        actual_price = read_field(args.port, target_id, "Additional amount")
        price_match = actual_price == str(v["price_cents"])
        print(f"{'Variant: ' + v['name'] + ' price':<20} {truncate(str(v['price_cents']),55):<60} {truncate(actual_price,55):<60} {'PASS' if price_match else 'FAIL'}")
        results.append((f"Variant {v['name']} price", price_match))

    # Variant descriptions
    for v in data["variants"]:
        actual_vdesc = read_field(args.port, target_id, "Description")
        vdesc_match = v["description"] in actual_vdesc if actual_vdesc else False
        print(f"{'Variant: ' + v['name'] + ' desc':<20} {truncate(v['description'],55):<60} {truncate(actual_vdesc,55):<60} {'PASS' if vdesc_match else 'FAIL'}")
        results.append((f"Variant {v['name']} desc", vdesc_match))

    # Save button check
    save_btn = read_save_button(args.port, target_id)
    print(f"\n{'Save button':<20} {'Expected: Save/Publish/Update':<60} {truncate(save_btn,55):<60} {'FOUND' if save_btn != 'NOT_FOUND' else 'NOT_FOUND'}")

    # Click Save
    if save_btn != "NOT_FOUND":
        click_result = click_save(args.port, target_id)
        print(f"\n✓ Save clicked via: {click_result}")
    else:
        print("\n⚠️  Save button not found — manual save required")

    # Wait and re-verify
    print("\nWaiting 3s for save to process...")
    import time
    time.sleep(3)

    # Re-read to confirm
    print("\n--- Post-save verification ---")
    fp_after = read_field(args.port, target_id, "Fine print")
    fp_ok = fp_after == data["fine_print"]
    print(f"Fine Print after save: {'PASS' if fp_ok else 'FAIL'}")
    results.append(("Fine Print (post-save)", fp_ok))

    # OCR screenshot if requested
    if args.ocr:
        print("\n--- OCR Screenshot Check ---")
        img_path, ocr_text = ocr_screenshot(args.port, target_id)
        if ocr_text:
            key_phrases = ["Live Demo", "Freelancer ROI", "Ship Client PWAs"]
            for phrase in key_phrases:
                found = phrase.lower() in ocr_text.lower()
                print(f"  '{phrase}': {'FOUND' if found else 'NOT FOUND'}")
        else:
            print("  ponytail: install tesseract-ocr if rendered visual check matters; DOM check is primary")

    # Summary
    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    print(f"\n{'='*40}")
    print(f"Results: {passed}/{total} fields PASS")
    print(f"{'='*40}")

    # Save log
    log = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "tab": tab["title"],
        "before": {
            "fine_print": actual_fp if 'actual_fp' in dir() else "N/A",
            "title": actual_name if 'actual_name' in dir() else "N/A",
        },
        "after": {
            "fine_print": fp_after if 'fp_after' in dir() else "N/A",
        },
        "save_clicked": save_btn != "NOT_FOUND",
        "results": {k: bool(v) for k, v in results},
    }
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_push.json")
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2, default=str)
    print(f"\nLog saved to {log_path}")


if __name__ == "__main__":
    main()
