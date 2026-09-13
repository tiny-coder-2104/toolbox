const c = require('./cdp');
const fs = require('fs');
const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/C65841BB8EE85B55408BF2266F400D82';

const answer = `If you have **Node.js** installed (which most systems do), you can validate JSON with a simple one-liner:

\`\`\`bash
node -e "JSON.parse(require('fs').readFileSync('yourfile.json','utf8'))" && echo "Valid" || echo "Invalid"
\`\`\`

Or for **stdin** (piping from another command):

\`\`\`bash
echo '{"key": "value"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{JSON.parse(d);console.log('Valid')}catch(e){console.error('Invalid:',e.message);process.exit(1)}})"
\`\`\`

### For repeated use

If you validate JSON often, there's a lightweight CLI tool that wraps this logic:

\`\`\`bash
# Clone and link (zero dependencies, just Node.js)
git clone https://github.com/tiny-coder-2104/json-validator-cli.git
cd json-validator-cli && npm link

# Usage
json-validate data.json
json-validate --pretty config.json
cat package.json | json-validate
\`\`\`

It shows the JSON type, size, and detailed error messages with line/column numbers.

### Other built-in options

| Tool | Command | Notes |
|------|---------|-------|
| **Python** | \`python -mjson.tool file.json > /dev/null\` | Works on most systems |
| **jq** | \`jq . file.json > /dev/null\` | Fast, but requires install |
| **Perl** | \`json_pp < file.json > /dev/null\` | Usually pre-installed |

The Node.js one-liner is often the simplest if you're already in a Node environment.`;

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function sendCmd(ws, method, params, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const timer = setTimeout(() => { ws.removeListener('message', handler); reject(new Error('CDP timeout after ' + timeout + 'ms')); }, timeout);
    const handler = data => {
      const msg = JSON.parse(data);
      if (msg.id === id) { clearTimeout(timer); ws.removeListener('message', handler); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInTab(wsUrl, expression) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  ws.close();
  return r.result || r;
}

async function takeScreenshot(wsUrl, outPath) {
  const ws = await wsConnect(wsUrl);
  const r = await sendCmd(ws, 'Page.captureScreenshot', { format: 'png' });
  ws.close();
  if (r && r.data) {
    const buf = Buffer.from(r.data, 'base64');
    fs.writeFileSync(outPath, buf);
    return outPath;
  }
  throw new Error('No screenshot data returned');
}

async function postAnswer() {
  try {
    // Navigate to the target question
    console.log('Navigating to question...');
    await evalInTab(wsUrl, "window.location.href = 'https://stackoverflow.com/questions/42385036/validate-json-file-syntax-in-shell-script-without-installing-any-package';");
    
    // Wait for page to load
    await new Promise(r => setTimeout(r, 5000));
    
    // Find the answer textarea and fill it
    console.log('Finding answer textarea...');
    await evalInTab(wsUrl, `
      const textarea = document.querySelector('#wmd-input') || document.querySelector('textarea[name="answer"]') || document.querySelector('.wmd-input');
      if (textarea) {
        textarea.value = ${JSON.stringify(answer)};
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Answer filled');
      } else {
        console.log('Textarea not found');
        console.log('Available textareas:', document.querySelectorAll('textarea'));
      }
    `);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Click the Post Your Answer button
    console.log('Clicking Post Your Answer button...');
    await evalInTab(wsUrl, `
      const btn = document.querySelector('#submit-button') || document.querySelector('button[id*="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Post Your Answer'));
      if (btn) {
        btn.click();
        console.log('Button clicked');
      } else {
        console.log('Button not found');
        console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent));
      }
    `);
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Take screenshot
    console.log('Taking screenshot...');
    const filename = '/home/yuki/ai_works/pseudo_human/logs/navigator/stackoverflow-answer-' + Date.now() + '.png';
    await takeScreenshot(wsUrl, filename);
    console.log('Screenshot saved to:', filename);
    
    // Verify answer was posted by checking page content
    console.log('Verifying answer posted...');
    const pageText = await evalInTab(wsUrl, "document.body.innerText");
    if (pageText.includes('Node.js') && pageText.includes('json-validator-cli')) {
      console.log('SUCCESS: Answer appears to be posted!');
    } else {
      console.log('WARNING: Answer may not have been posted. Page text sample:', pageText.substring(0, 500));
    }
    
  } catch (e) {
    console.error('Error:', e);
  }
}

postAnswer();
