'use strict';
const cdp = require('./cdp');

const REDDIT_TAB_ID = 'FB50164CDBA30CBA1D5BF6DA2FD17549';
const REDDIT_WS_URL = `ws://127.0.0.1:9222/devtools/page/${REDDIT_TAB_ID}`;

const TITLE = "Built a JSON formatter in ~95 lines of vanilla JS — no backend, no API key";
const BODY = `Been working with messy JSON configs all week and got tired of pasting into random online tools that silently phone home. Wrote a quick browser-based formatter/minifier/validator — all client-side, nothing leaves your tab.

What it does:
- Format messy JSON in one click
- Minify to save bandwidth
- Syntax validation with error highlighting
- Works offline, zero dependencies

The JS itself is ~95 lines. I wrote it because I needed something I could actually trust with sensitive config files.

Would appreciate feedback — especially from folks who deal with APIs or config files daily. Anything that'd make this more useful?

[link to tool]

Quick note: this is the free standalone version from TinyCoder Toolbox — our 5-tool PWA starter kit is $29 if you need more. Not trying to slide sales in here, just being transparent about where this sits.`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function navigateToSubreddit() {
  console.log('Navigating to r/json...');
  await cdp.evalInTab(REDDIT_WS_URL, `window.location.href = 'https://www.reddit.com/r/json/'`);
  await sleep(3000);
}

async function clickCreatePost() {
  console.log('Clicking Create Post...');
  const selectors = [
    'button[data-testid="create-post-button"]',
    'button:has-text("Create Post")',
    '[data-testid="create-post-button"]',
    'a[href*="/submit"]',
    'button:contains("Create Post")'
  ];
  
  for (const selector of selectors) {
    try {
      const result = await cdp.evalInTab(REDDIT_WS_URL, `
        (function() {
          const els = document.querySelectorAll('${selector}');
          for (let el of els) {
            if (el.textContent.includes('Create Post') || el.textContent.includes('Post')) {
              el.click();
              return { ok: true, selector: '${selector}' };
            }
          }
          return { error: 'not found' };
        })()
      `);
      if (result.ok) {
        console.log(`Clicked Create Post with selector: ${result.selector}`);
        await sleep(2000);
        return true;
      }
    } catch (e) {
      console.log(`Selector ${selector} failed:`, e.message);
    }
  }
  return false;
}

async function selectTextPostType() {
  console.log('Selecting Text post type...');
  await sleep(1000);
  const result = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      // Try to find and click the Text tab/button
      const buttons = document.querySelectorAll('button, [role="tab"], [data-testid]');
      for (let btn of buttons) {
        const text = btn.textContent.trim().toLowerCase();
        if (text === 'text' || text.includes('text post') || text === 'post') {
          btn.click();
          return { ok: true, text: btn.textContent.trim() };
        }
      }
      return { error: 'Text post type not found' };
    })()
  `);
  console.log('Text post type result:', result);
  await sleep(1000);
  return result.ok;
}

async function fillTitleAndBody() {
  console.log('Filling title and body...');
  
  // Fill title
  const titleResult = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
      for (let input of inputs) {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        
        if (placeholder.includes('title') || name.includes('title') || id.includes('title') || ariaLabel.includes('title')) {
          input.focus();
          input.value = ${JSON.stringify(TITLE)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true, type: input.tagName, placeholder: input.placeholder };
        }
      }
      return { error: 'Title input not found' };
    })()
  `);
  console.log('Title fill result:', titleResult);
  
  // Fill body
  const bodyResult = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      const inputs = document.querySelectorAll('textarea, [contenteditable="true"]');
      for (let input of inputs) {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        
        if (placeholder.includes('text') || placeholder.includes('body') || placeholder.includes('content') || 
            name.includes('text') || name.includes('body') || id.includes('text') || id.includes('body') ||
            ariaLabel.includes('text') || ariaLabel.includes('body') || ariaLabel.includes('content')) {
          input.focus();
          input.value = ${JSON.stringify(BODY)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true, type: input.tagName, placeholder: input.placeholder };
        }
      }
      return { error: 'Body input not found' };
    })()
  `);
  console.log('Body fill result:', bodyResult);
  
  await sleep(1000);
  return titleResult.ok && bodyResult.ok;
}

async function clickPostButton() {
  console.log('Clicking Post button...');
  const result = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      const buttons = document.querySelectorAll('button');
      for (let btn of buttons) {
        const text = btn.textContent.trim().toLowerCase();
        if (text === 'post' || text === 'submit' || text.includes('post')) {
          // Check if it's the main post button (not cancel)
          if (!text.includes('cancel') && !text.includes('back')) {
            btn.click();
            return { ok: true, text: btn.textContent.trim() };
          }
        }
      }
      return { error: 'Post button not found' };
    })()
  `);
  console.log('Post button result:', result);
  await sleep(3000);
  return result.ok;
}

async function getPostUrl() {
  console.log('Getting post URL...');
  const result = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      // Try to find the post URL after posting
      const links = document.querySelectorAll('a[href*="/comments/"]');
      for (let link of links) {
        if (link.href.includes('/r/json/comments/')) {
          return { ok: true, url: link.href };
        }
      }
      // Also check current URL
      if (window.location.href.includes('/r/json/comments/')) {
        return { ok: true, url: window.location.href };
      }
      return { error: 'Post URL not found' };
    })()
  `);
  console.log('Post URL result:', result);
  return result.ok ? result.url : null;
}

async function takeScreenshot() {
  console.log('Taking screenshot...');
  const fs = require('fs');
  const path = require('path');
  const outDir = path.join(__dirname, '..', 'logs', 'navigator');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `reddit-text-post-${Date.now()}.png`);
  
  await cdp.screenshot(REDDIT_WS_URL, outPath);
  console.log('Screenshot saved to:', outPath);
  return outPath;
}

async function main() {
  console.log('Starting Reddit TEXT post automation...');
  console.log('Using Reddit tab:', REDDIT_TAB_ID);
  
  try {
    // Step 1: Navigate to r/json
    await navigateToSubreddit();
    
    // Step 2: Click Create Post
    const createPostClicked = await clickCreatePost();
    if (!createPostClicked) {
      console.log('Failed to click Create Post');
      await takeScreenshot();
      return { success: false, error: 'Failed to click Create Post' };
    }
    
    // Step 3: Select Text post type
    await selectTextPostType();
    
    // Step 4: Fill title and body
    await fillTitleAndBody();
    
    // Step 5: Click Post button
    const posted = await clickPostButton();
    if (!posted) {
      console.log('Failed to click Post button');
      await takeScreenshot();
      return { success: false, error: 'Failed to click Post button' };
    }
    
    // Step 6: Get post URL
    const postUrl = await getPostUrl();
    
    // Step 7: Take screenshot
    await takeScreenshot();
    
    console.log('Done!');
    return { success: true, postUrl };
  } catch (error) {
    console.error('Error:', error);
    await takeScreenshot();
    return { success: false, error: error.message };
  }
}

main().then(result => {
  console.log('\n=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});
