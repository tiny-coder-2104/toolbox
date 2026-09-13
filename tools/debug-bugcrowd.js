const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugPage() {
  const logsDir = '/home/yuki/ai_works/pseudo_human/logs/navigator';
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(logsDir, `${timestamp}-debug.png`);
  
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
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath);
    
    // Get page content
    const content = await page.content();
    fs.writeFileSync(path.join(logsDir, `${timestamp}-page.html`), content);
    console.log('HTML saved');
    
    // Find all links and buttons
    const links = await page.locator('a').all();
    console.log('\n=== LINKS ===');
    for (const link of links.slice(0, 30)) {
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      if (text.trim()) console.log(`  "${text.trim()}" -> ${href}`);
    }
    
    const buttons = await page.locator('button').all();
    console.log('\n=== BUTTONS ===');
    for (const btn of buttons.slice(0, 20)) {
      const text = await btn.textContent().catch(() => '');
      if (text.trim()) console.log(`  "${text.trim()}"`);
    }
    
    // Check for login form
    const inputs = await page.locator('input').all();
    console.log('\n=== INPUTS ===');
    for (const input of inputs.slice(0, 20)) {
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      console.log(`  type=${type} name=${name} id=${id}`);
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: screenshotPath.replace('.png', '-ERROR.png'), fullPage: true });
    await browser.close();
  }
}

debugPage().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
