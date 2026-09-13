const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugOkta2() {
  const logsDir = '/home/yuki/ai_works/pseudo_human/logs/navigator';
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(logsDir, `${timestamp}-debug-okta2.png`);
  
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
    console.log('Navigating to Hacker Login...');
    await page.goto('https://bugcrowd.com/user/sign_in', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-01-login.png'), fullPage: true });
    
    // Fill email
    await page.fill('input[name="identifier"]', 'bugcrowd-slgzf9xw@bugbounty-test.example.com');
    await page.click('input[type="submit"][value="Next"]');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-02-after-email.png'), fullPage: true });
    
    // Wait for the page to settle
    await page.waitForTimeout(3000);
    
    // Click "Enter a verification code instead" to see if password field appears
    console.log('Clicking "Enter a verification code instead"...');
    await page.click('button:has-text("Enter a verification code instead"), a:has-text("Enter a verification code instead")').catch(() => {});
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-03-after-code-link.png'), fullPage: true });
    
    // Check inputs again
    const inputs = await page.locator('input').all();
    console.log('\n=== ALL INPUTS AFTER CODE LINK ===');
    for (const input of inputs) {
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      const visible = await input.isVisible().catch(() => false);
      console.log(`  type=${type} name="${name}" id="${id}" visible=${visible}`);
    }
    
    // Try clicking "Return to authenticator list" 
    console.log('Clicking "Return to authenticator list"...');
    await page.click('a:has-text("Return to authenticator list")').catch(() => {});
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-04-authenticator-list.png'), fullPage: true });
    
    const inputs2 = await page.locator('input').all();
    console.log('\n=== ALL INPUTS AFTER AUTHENTICATOR LIST ===');
    for (const input of inputs2) {
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      const visible = await input.isVisible().catch(() => false);
      console.log(`  type=${type} name="${name}" id="${id}" visible=${visible}`);
    }
    
    // Get page content
    const content = await page.content();
    fs.writeFileSync(path.join(logsDir, `${timestamp}-okta-final.html`), content);
    console.log('HTML saved');
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: screenshotPath.replace('.png', '-ERROR.png'), fullPage: true });
    await browser.close();
  }
}

debugOkta2().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
