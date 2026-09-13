const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugIdentity() {
  const logsDir = '/home/yuki/ai_works/pseudo_human/logs/navigator';
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(logsDir, `${timestamp}-debug-identity.png`);
  
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
    console.log('Navigating to identity.bugcrowd.com...');
    await page.goto('https://identity.bugcrowd.com/login', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-01-identity.png'), fullPage: true });
    
    // Get all inputs
    const inputs = await page.locator('input').all();
    console.log('\n=== ALL INPUTS ===');
    for (const input of inputs) {
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      const visible = await input.isVisible().catch(() => false);
      console.log(`  type=${type} name="${name}" id="${id}" visible=${visible}`);
    }
    
    // Get page content
    const content = await page.content();
    fs.writeFileSync(path.join(logsDir, `${timestamp}-identity.html`), content);
    console.log('HTML saved');
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: screenshotPath.replace('.png', '-ERROR.png'), fullPage: true });
    await browser.close();
  }
}

debugIdentity().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
