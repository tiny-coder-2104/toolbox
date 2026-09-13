'use strict';

const cdp = require('./cdp');
const fs = require('fs');

const EMAIL = 'tinycoder-studio@bugcrowdninja.com';
const PASSWORD = 'TestHunterA2024!@#$%'; // Strong password - will save this
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
  const page = targets.find(t => t.type === 'page' && t.url.includes('shop.monash.edu/customer/account/create'));
  if (!page) throw new Error('Monash registration page not found');
  return page.webSocketDebuggerUrl;
}

async function fillForm(wsUrl) {
  console.log('Re-filling form fields...');
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#firstname');
    if (el) { el.value = '${FIRSTNAME}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#lastname');
    if (el) { el.value = '${LASTNAME}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#email_address');
    if (el) { el.value = '${EMAIL}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#password');
    if (el) { el.value = '${PASSWORD}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#password-confirmation');
    if (el) { el.value = '${PASSWORD}'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  await cdp.evalInTab(wsUrl, `
    const el = document.querySelector('#aw_gdpr_consent');
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }
  `);
  
  console.log('Form fields re-filled');
}

async function waitForRecaptchaToken(wsUrl, maxWaitMs = 180000) {
  console.log('Waiting for reCAPTCHA token (up to 3 minutes)...');
  console.log('>>> HUMAN: Please click "Create my account" button to trigger invisible reCAPTCHA and solve any challenge <<<');
  const start = Date.now();
  
  while (Date.now() - start < maxWaitMs) {
    const tokenResult = await cdp.evalInTab(wsUrl, `
      (function() {
        const response = document.querySelector('#g-recaptcha-response');
        return response ? response.value : '';
      })()
    `);
    
    const token = tokenResult?.value || tokenResult;
    if (token && token.length > 0) {
      console.log('reCAPTCHA token received! Length:', token.length);
      return token;
    }
    
    const invisibleResult = await cdp.evalInTab(wsUrl, `
      (function() {
        const response = document.querySelector('textarea[name="g-recaptcha-response"]');
        return response ? response.value : '';
      })()
    `);
    
    const invisibleToken = invisibleResult?.value || invisibleResult;
    if (invisibleToken && invisibleToken.length > 0) {
      console.log('Invisible reCAPTCHA token received! Length:', invisibleToken.length);
      return invisibleToken;
    }
    
    const urlResult = await cdp.evalInTab(wsUrl, `window.location.href`);
    const url = urlResult?.value || urlResult;
    if (url && url.includes('/customer/account/') && !url.includes('/create')) {
      console.log('Redirected to account page - success!');
      return 'REDIRECTED';
    }
    
    await new Promise(r => setTimeout(r, 3000));
  }
  
  throw new Error('Timeout waiting for reCAPTCHA token');
}

async function checkResult(wsUrl) {
  await new Promise(r => setTimeout(r, 3000));
  
  const result = await cdp.evalInTab(wsUrl, `
    (function() {
      const url = window.location.href;
      const bodyText = document.body.innerText;
      
      const success = url.includes('/customer/account/') && !url.includes('/create');
      
      const errorElements = document.querySelectorAll('.message-error, .error-message, [data-ui-id="message-error"], .messages .error');
      const errors = Array.from(errorElements).map(e => e.innerText).join(' | ');
      
      return { 
        url, 
        success, 
        error: errors,
        errors: errors,
        bodyText: bodyText.substring(0, 3000) 
      };
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
  console.log('Retrying Monash Shop registration...');
  console.log('Email:', EMAIL);
  console.log('Password:', PASSWORD);
  
  try {
    const wsUrl = await getTarget();
    console.log('Connected to Chrome tab');
    
    // Re-fill form
    await fillForm(wsUrl);
    
    // Verify form filled
    const firstname = await cdp.evalInTab(wsUrl, "document.querySelector('#firstname')?.value");
    console.log('Firstname verified:', firstname?.value);
    
    await takeScreenshot(wsUrl, 'monash-registration-refilled');
    
    // Wait for reCAPTCHA to be solved by human (triggered by clicking submit)
    try {
      await waitForRecaptchaToken(wsUrl);
    } catch (e) {
      console.log('reCAPTCHA timeout:', e.message);
      await takeScreenshot(wsUrl, 'monash-recaptcha-timeout-retry');
    }
    
    // Check result
    const result = await checkResult(wsUrl);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    await takeScreenshot(wsUrl, 'monash-registration-final-retry');
    
    if (result.value?.success) {
      console.log('✅ Account creation SUCCESS!');
      await saveCredentials();
      return { success: true, email: EMAIL };
    } else {
      console.log('❌ Account creation failed or pending');
      return { success: false, email: EMAIL, details: result.value };
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
