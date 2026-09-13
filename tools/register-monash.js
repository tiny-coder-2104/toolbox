'use strict';

const cdp = require('./cdp');
const fs = require('fs');
const path = require('path');

// Generate strong password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < 20; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

const EMAIL = 'tinycoder-studio@bugcrowdninja.com';
const PASSWORD = generatePassword();
const FIRSTNAME = 'Test';
const LASTNAME = 'HunterA';

const CREDENTIALS_FILE = '/home/yuki/ai_works/pseudo_human/bug-bounty/notes/credentials.md';

async function saveCredentials() {
  const entry = `\n## Monash Shop Account A\n- **Email:** ${EMAIL}\n- **Password:** ${PASSWORD}\n- **Created:** ${new Date().toISOString()}\n`;
  fs.appendFileSync(CREDENTIALS_FILE, entry);
  console.log('Credentials saved to', CREDENTIALS_FILE);
}

async function getTarget() {
  const targets = await cdp.listTargets();
  // Find the Monash registration page
  const page = targets.find(t => t.type === 'page' && t.url.includes('shop.monash.edu/customer/account/create'));
  if (!page) throw new Error('Monash registration page not found in open tabs');
  console.log('Found target:', page.url);
  return page.webSocketDebuggerUrl;
}

async function fillForm(wsUrl) {
  console.log('Filling form fields...');
  
  // Fill firstname
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#firstname');
    if (el) { el.value = '${FIRSTNAME}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  // Fill lastname
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#lastname');
    if (el) { el.value = '${LASTNAME}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  // Fill email
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#email_address');
    if (el) { el.value = '${EMAIL}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  // Fill password
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#password');
    if (el) { el.value = '${PASSWORD}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  // Fill password confirmation
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#password-confirmation');
    if (el) { el.value = '${PASSWORD}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  // Check GDPR consent
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#aw_gdpr_consent');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  console.log('Form fields filled');
}

async function clickRecaptcha(wsUrl) {
  console.log('Attempting to click reCAPTCHA checkbox...');
  
  // Try to find and click the reCAPTCHA checkbox
  const result = await cdp.evalInTab(wsUrl, `
    (function() {
      // Find reCAPTCHA iframe
      const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
      for (const iframe of iframes) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const checkbox = doc.querySelector('.recaptcha-checkbox-border') || doc.querySelector('#recaptcha-anchor') || doc.querySelector('[role="checkbox"]');
          if (checkbox) {
            checkbox.click();
            return { ok: true, method: 'iframe-click' };
          }
        } catch (e) {
          // Cross-origin, can't access
        }
      }
      // Try clicking the checkbox directly if it's not in iframe
      const checkbox = document.querySelector('.g-recaptcha') || document.querySelector('[data-sitekey]');
      if (checkbox) {
        checkbox.click();
        return { ok: true, method: 'direct-click' };
      }
      return { ok: false, error: 'No reCAPTCHA found' };
    })()
  `);
  
  console.log('reCAPTCHA click result:', result);
  return result;
}

async function waitForRecaptchaToken(wsUrl, maxWaitMs = 180000) {
  console.log('Waiting for reCAPTCHA token (up to 3 minutes)...');
  const start = Date.now();
  
  while (Date.now() - start < maxWaitMs) {
    const token = await cdp.evalInTab(wsUrl, `
      (function() {
        const response = document.querySelector('#g-recaptcha-response');
        return response ? response.value : '';
      })()
    `);
    
    if (token && token.length > 0) {
      console.log('reCAPTCHA token received!');
      return token;
    }
    
    // Also check for invisible reCAPTCHA token
    const invisibleToken = await cdp.evalInTab(wsUrl, `
      (function() {
        const response = document.querySelector('textarea[name="g-recaptcha-response"]');
        return response ? response.value : '';
      })()
    `);
    
    if (invisibleToken && invisibleToken.length > 0) {
      console.log('Invisible reCAPTCHA token received!');
      return invisibleToken;
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  
  throw new Error('Timeout waiting for reCAPTCHA token');
}

async function submitForm(wsUrl) {
  console.log('Submitting form...');
  
  const result = await cdp.evalInTab(wsUrl, `
    (function() {
      const btn = document.querySelector('button[type="submit"]') || 
                  document.querySelector('button[title="Create an Account"]') ||
                  document.querySelector('.action.submit.primary') ||
                  document.querySelector('#send2') ||
                  document.querySelector('button.action.submit.primary');
      if (btn) {
        btn.click();
        return { ok: true };
      }
      return { ok: false, error: 'Submit button not found' };
    })()
  `);
  
  console.log('Submit result:', result);
  return result;
}

async function checkResult(wsUrl) {
  // Wait for navigation/result
  await new Promise(r => setTimeout(r, 5000));
  
  const result = await cdp.evalInTab(wsUrl, `
    (function() {
      const url = window.location.href;
      const bodyText = document.body.innerText;
      
      // Check for success indicators
      const success = url.includes('/customer/account/') || 
                      bodyText.includes('Welcome') ||
                      bodyText.includes('Thank you for registering') ||
                      bodyText.includes('My Account') ||
                      bodyText.includes('Account Dashboard');
      
      // Check for error indicators
      const error = bodyText.includes('error') || 
                    bodyText.includes('Error') ||
                    bodyText.includes('captcha') ||
                    bodyText.includes('reCAPTCHA') ||
                    document.querySelector('.message-error') !== null;
      
      return { url, success, error, bodyText: bodyText.substring(0, 2000) };
    })()
  `);
  
  return result;
}

async function takeScreenshot(wsUrl, name) {
  const outPath = `/home/yuki/ai_works/pseudo_human/logs/navigator/${new Date().toISOString().replace(/[:.]/g, '-')}-${name}.png`;
  await cdp.screenshot(wsUrl, outPath);
  console.log('Screenshot saved:', outPath);
  return outPath;
}

async function main() {
  console.log('Starting Monash Shop registration...');
  console.log('Email:', EMAIL);
  console.log('Password: [GENERATED - saved to credentials.md]');
  
  try {
    // Get target (page already open)
    const wsUrl = await getTarget();
    console.log('Connected to Chrome tab');
    
    // Take initial screenshot
    await takeScreenshot(wsUrl, 'monash-registration-initial');
    
    // Fill form
    await fillForm(wsUrl);
    
    // Take screenshot after filling
    await takeScreenshot(wsUrl, 'monash-registration-filled');
    
    // Click reCAPTCHA
    await clickRecaptcha(wsUrl);
    
    // Wait for reCAPTCHA token (human solves)
    try {
      await waitForRecaptchaToken(wsUrl);
    } catch (e) {
      console.log('reCAPTCHA timeout - human may need to solve manually');
      await takeScreenshot(wsUrl, 'monash-recaptcha-timeout');
      // Continue anyway - maybe invisible reCAPTCHA
    }
    
    // Submit form
    await submitForm(wsUrl);
    
    // Check result
    const result = await checkResult(wsUrl);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Take final screenshot
    await takeScreenshot(wsUrl, 'monash-registration-result');
    
    if (result.success) {
      console.log('✅ Account creation SUCCESS!');
      await saveCredentials();
      return { success: true, email: EMAIL };
    } else {
      console.log('❌ Account creation may have failed');
      return { success: false, email: EMAIL, details: result };
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    return { success: false, email: EMAIL, error: err.message };
  }
}

main().then(result => {
  console.log('\n=== FINAL RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
