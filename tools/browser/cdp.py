#!/usr/bin/env python3
"""Minimal Chrome DevTools Protocol client.
Pure python3.6 stdlib: hand-rolled websocket, no pip deps.
"""
import base64
import json
import os
import socket
import struct
import sys
import time

BUF = 4096

def ws_connect(port, target_id):
    s = socket.create_connection(("127.0.0.1", port), timeout=15)
    key = base64.b64encode(os.urandom(16)).decode()
    path = "/devtools/page/%s" % target_id if target_id else _browser_ws_path(port)
    req = (
        "GET %s HTTP/1.1\r\n"
        "Host: 127.0.0.1:%d\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        "Sec-WebSocket-Key: %s\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        "\r\n" % (path, port, key)
    )
    s.sendall(req.encode())
    resp = b""
    while b"\r\n\r\n" not in resp:
        chunk = s.recv(BUF)
        if not chunk:
            raise ConnectionError("websocket handshake failed")
        resp += chunk
    if b" 101 " not in resp.split(b"\r\n", 1)[0]:
        raise ConnectionError("websocket handshake rejected: %r" % resp[:200])
    return s

def _browser_ws_path(port):
    import urllib.request
    ver = json.loads(urllib.request.urlopen(
        "http://127.0.0.1:%d/json/version" % port, timeout=5).read())
    return ver["webSocketDebuggerUrl"].split("127.0.0.1")[1]

def _encode_frame(payload):
    data = payload.encode()
    b0 = 0x80 | 0x1
    mask = os.urandom(4)
    n = len(data)
    if n < 126:
        header = bytes([b0, 0x80 | n])
    elif n < 65536:
        header = bytes([b0, 0x80 | 126]) + struct.pack(">H", n)
    else:
        header = bytes([b0, 0x80 | 127]) + struct.pack(">Q", n)
    masked = bytes(c ^ mask[i % 4] for i, c in enumerate(data))
    return header + mask + masked

def _recv_frame(s):
    def recvn(n):
        data = b""
        while len(data) < n:
            chunk = s.recv(n - len(data))
            if not chunk:
                raise ConnectionError("ws closed")
            data += chunk
        return data

    b0, b1 = recvn(2)
    opcode = b0 & 0x0F
    n = b1 & 0x7F
    if n == 126:
        n = struct.unpack(">H", recvn(2))[0]
    elif n == 127:
        n = struct.unpack(">Q", recvn(8))[0]
    if b1 & 0x80:
        recvn(4)
    return opcode, recvn(n)

def _read_text_frame(s):
    data = b""
    while True:
        opcode, chunk = _recv_frame(s)
        if opcode == 0x8:
            raise ConnectionError("ws closed by server")
        if opcode == 0x9:
            s.sendall(_encode_frame_raw_pong(chunk))
            continue
        if opcode in (0x1, 0x0, 0x2):
            data += chunk
            if opcode != 0x0:
                break
    return data.decode("utf-8", "replace")

def _encode_frame_raw_pong(payload):
    header = bytes([0x80 | 0xA, len(payload)])
    return header + payload

class CDP:
    def __init__(self, port, target_id):
        self.sock = ws_connect(port, target_id)
        self.id = 0
        self.pending = {}
        self.events = []

    def send(self, method, **params):
        self.id += 1
        msg = {"id": self.id, "method": method}
        if params:
            msg["params"] = params
        self.sock.sendall(_encode_frame(json.dumps(msg)))
        while True:
            text = _read_text_frame(self.sock)
            obj = json.loads(text)
            if obj.get("id") == self.id:
                return obj
            if obj.get("method"):
                self.events.append(obj)

    def evaluate(self, expr):
        r = self.send("Runtime.evaluate",
                      expression=expr,
                      returnByValue=True,
                      awaitPromise=True)
        if "error" in r:
            return {"error": r["error"]["message"]}
        return r.get("result", {}).get("result", {})

    def shot(self, path="/tmp/shot.png"):
        r = self.send("Page.captureScreenshot", format="png")
        data = r["result"]["data"]
        with open(path, "wb") as f:
            f.write(base64.b64decode(data))
        return path

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass

def list_tabs(port):
    import urllib.request
    tabs = json.loads(urllib.request.urlopen(
        "http://127.0.0.1:%d/json" % port, timeout=5).read())
    pages = [t for t in tabs if t.get("type") == "page"]
    return pages

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9222
    for t in list_tabs(port):
        print(t.get("title", "")[:60], "|", t.get("url", "")[:100])