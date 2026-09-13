'use strict';

const cdp = require('./cdp');
const fs = require('fs');

const EMAIL = 'tinycoder-studio@bugcrowdninja.com';
const PASSWORD = 'GENERATED_PASSWORD_PLACEHOLDER'; // Will be read from credentials file
const FIRSTNAME = 'Test';
const LASTNAME = 'HunterA';

async function getTarget() {
  const targets = await cdp.listTargets();
  const page = targets.find(t => t.type === 'page' && t.url.includes('shop.monash.edu/customer/account/create'));
  if (!page) throw new Error('Monash registration page not found');
  return page.webSocketDebuggerUrl;
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
      console.log('reCAPTCHA token received! Length:', token.length);
      return token;
    }
    
    const invisibleToken = await cdp.evalInTab(wsUrl, `
      (function() {
        const response = document.querySelector('textarea[name="g-recaptcha-response"]');
        return response ? response.value : '';
      })()
    `);
    
    if (invisibleToken && invisibleToken.length > 0) {
      console.log('Invisible reCAPTCHA token received! Length:', invisibleToken.length);
      return invisibleToken;
    }
    
    // Check for error messages
    const errorCheck = await cdp.evalInTab(wsUrl, `
      (function() {
        const errors = document.querySelectorAll('.message-error, .error-message, [data-ui-id="message-error"]');
        return Array.from(errors).map(e => e.innerText).join(' | ');
      })()
    `);
    
    if (errorCheck) {
      console.log('Error messages found:', errorCheck);
    }
    
    await new Promise(r => setTimeout(r, 3000));
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
  await new Promise(r => setTimeout(r, 5000));
  
  const result = await cdp.evalInTab(wsUrl, `
    (function() {
      const url = window.location.href;
      const bodyText = document.body.innerText;
      
      // Check for success - redirect to account page
      const success = url.includes('/customer/account/') && !url.includes('/create');
      
      // Check for error messages on the page
      const errorElements = document.querySelectorAll('.message-error, .error-message, [data-ui-id="message-error"], .messages .error');
      const errors = Array.from(errorElements).map(e => e.innerText).join(' | ');
      
      // Check for reCAPTCHA specific errors
      const recaptchaError = bodyText.includes('reCAPTCHA') || bodyText.includes('captcha verification');
      
      return { 
        url, 
        success, 
        error: errors || recaptchaError,
        errors: errors,
        recaptchaError,
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
  console.log('Continuing Monash Shop registration...');
  console.log('Email:', EMAIL);
  
  try {
    const wsUrl = await getTarget();
    console.log('Connected to Chrome tab');
    
    // Wait for reCAPTCHA to be solved by human
    try {
      await waitForRecaptchaToken(wsUrl);
    } catch (e) {
      console.log('reCAPTCHA timeout:', e.message);
      await takeScreenshot(wsUrl, 'monash-recaptcha-timeout-2');
    }
    
    // Submit form
    await submitForm(wsUrl);
    
    // Check result
    const result = await checkResult(wsUrl);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    await takeScreenshot(wsUrl, 'monash-registration-result-2');
    
    if (result.value?.success) {
      console.log('✅ Account creation SUCCESS!');
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
