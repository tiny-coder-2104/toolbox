const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugForm() {
  const logsDir = '/home/yuki/ai_works/pseudo_human/logs/navigator';
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(logsDir, `${timestamp}-debug-form.png`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    console.log('Navigating to OpenSea Bugcrowd page...');
    await page.goto('https://bugcrowd.com/engagements/opensea', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Click Submit report link
    await page.click('a:has-text("Submit report")');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath);
    
    // Get page content
    const content = await page.content();
    fs.writeFileSync(path.join(logsDir, `${timestamp}-form-page.html`), content);
    console.log('HTML saved');
    
    // Find all form elements
    const inputs = await page.locator('input, textarea, select').all();
    console.log('\n=== FORM ELEMENTS ===');
    for (const input of inputs) {
      const tag = await input.evaluate(el => el.tagName.toLowerCase());
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      const placeholder = await input.getAttribute('placeholder').catch(() => '');
      console.log(`  <${tag}> type=${type} name="${name}" id="${id}" placeholder="${placeholder}"`);
    }
    
    // Find all labels
    const labels = await page.locator('label').all();
    console.log('\n=== LABELS ===');
    for (const label of labels.slice(0, 30)) {
      const text = await label.textContent().catch(() => '');
      const forAttr = await label.getAttribute('for').catch(() => '');
      if (text.trim()) console.log(`  "${text.trim()}" for="${forAttr}"`);
    }
    
    // Find buttons
    const buttons = await page.locator('button, input[type="submit"]').all();
    console.log('\n=== BUTTONS ===');
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      const type = await btn.getAttribute('type').catch(() => '');
      const value = await btn.getAttribute('value').catch(() => '');
      console.log(`  "${text.trim()}" type=${type} value="${value}"`);
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: screenshotPath.replace('.png', '-ERROR.png'), fullPage: true });
    await browser.close();
  }
}

debugForm().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
