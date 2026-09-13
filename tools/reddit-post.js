'use strict';
const cdp = require('./cdp');

const REDDIT_TAB_ID = '6CCC39A5987661A656B5D4ED740364B5';
const REDDIT_WS_URL = `ws://127.0.0.1:9222/devtools/page/${REDDIT_TAB_ID}`;

const TITLE = "Built a JSON Validator CLI in 100 Lines of Node.js — zero dependencies";
const URL = "https://github.com/tiny-coder-2104/json-validator-cli";
const COMMENT = `Hey r/json! I built a simple CLI tool to validate JSON files from the terminal. It's just 100 lines of Node.js with zero dependencies.

Features:
- Detailed error messages with line/column numbers
- Pretty-print with --pretty flag
- Stdin support for piping
- Color output

Usage:
\`\`\`bash
json-validate data.json
json-validate --pretty config.json
cat package.json | json-validate
\`\`\`

GitHub: https://github.com/tiny-coder-2104/json-validator-cli

Would love your feedback!`;

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
  // Try multiple selectors for the Create Post button
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

async function selectLinkPostType() {
  console.log('Selecting Link post type...');
  await sleep(1000);
  const result = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      // Try to find and click the Link tab/button
      const buttons = document.querySelectorAll('button, [role="tab"], [data-testid]');
      for (let btn of buttons) {
        const text = btn.textContent.trim().toLowerCase();
        if (text === 'link' || text.includes('link post')) {
          btn.click();
          return { ok: true, text: btn.textContent.trim() };
        }
      }
      return { error: 'Link post type not found' };
    })()
  `);
  console.log('Link post type result:', result);
  await sleep(1000);
  return result.ok;
}

async function fillTitleAndUrl() {
  console.log('Filling title and URL...');
  
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
  
  // Fill URL
  const urlResult = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
      for (let input of inputs) {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        
        if (placeholder.includes('url') || placeholder.includes('link') || name.includes('url') || id.includes('url') || ariaLabel.includes('url') || ariaLabel.includes('link')) {
          input.focus();
          input.value = ${JSON.stringify(URL)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true, type: input.tagName, placeholder: input.placeholder };
        }
      }
      return { error: 'URL input not found' };
    })()
  `);
  console.log('URL fill result:', urlResult);
  
  await sleep(1000);
  return titleResult.ok && urlResult.ok;
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

async function addComment() {
  console.log('Adding comment...');
  await sleep(2000);
  
  // Find the comment box and add comment
  const result = await cdp.evalInTab(REDDIT_WS_URL, `
    (function() {
      // Find comment textarea
      const textareas = document.querySelectorAll('textarea');
      for (let ta of textareas) {
        const placeholder = (ta.placeholder || '').toLowerCase();
        if (placeholder.includes('comment') || placeholder.includes('reply') || placeholder.includes('add a comment')) {
          ta.focus();
          ta.value = ${JSON.stringify(COMMENT)};
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Find and click the Comment/Reply button
          const buttons = document.querySelectorAll('button');
          for (let btn of buttons) {
            const text = btn.textContent.trim().toLowerCase();
            if ((text === 'comment' || text === 'reply' || text === 'post comment') && !text.includes('cancel')) {
              btn.click();
              return { ok: true, commentAdded: true };
            }
          }
          return { ok: true, commentAdded: false, error: 'Comment button not found' };
        }
      }
      return { error: 'Comment textarea not found' };
    })()
  `);
  console.log('Comment result:', result);
  await sleep(2000);
  return result.ok;
}

async function takeScreenshot() {
  console.log('Taking screenshot...');
  const fs = require('fs');
  const path = require('path');
  const outDir = path.join(__dirname, '..', 'logs', 'navigator');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `reddit-post-${Date.now()}.png`);
  
  await cdp.screenshot(REDDIT_WS_URL, outPath);
  console.log('Screenshot saved to:', outPath);
  return outPath;
}

async function main() {
  console.log('Starting Reddit post automation...');
  console.log('Using Reddit tab:', REDDIT_TAB_ID);
  
  try {
    // Step 1: Navigate to r/json
    await navigateToSubreddit();
    
    // Step 2: Click Create Post
    const createPostClicked = await clickCreatePost();
    if (!createPostClicked) {
      console.log('Failed to click Create Post');
      await takeScreenshot();
      return;
    }
    
    // Step 3: Select Link post type
    await selectLinkPostType();
    
    // Step 4: Fill title and URL
    await fillTitleAndUrl();
    
    // Step 5: Click Post button
    const posted = await clickPostButton();
    if (!posted) {
      console.log('Failed to click Post button');
      await takeScreenshot();
      return;
    }
    
    // Step 6: Add comment
    await addComment();
    
    // Step 7: Take screenshot
    await takeScreenshot();
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    await takeScreenshot();
  }
}

main();
