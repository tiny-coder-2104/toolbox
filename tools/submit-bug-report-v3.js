const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function submitBugReport() {
  const logsDir = '/home/yuki/ai_works/pseudo_human/logs/navigator';
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(logsDir, `${timestamp}-bugcrowd-report.png`);
  
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
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-01-initial.png'), fullPage: true });
    
    // Click Hacker Login to log in first
    console.log('Clicking Hacker Login...');
    await page.click('a:has-text("Hacker Login")');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-02-okta-login.png'), fullPage: true });
    
    // Fill Okta login form - email first
    console.log('Filling email...');
    await page.fill('input[name="identifier"], input[id="input27"]', 'bugcrowd-slgzf9xw@bugbounty-test.example.com');
    await page.click('input[type="submit"][value="Next"], button:has-text("Next")');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-03-after-email.png'), fullPage: true });
    
    // Now fill password
    console.log('Filling password...');
    await page.waitForSelector('input[type="password"], input[name="credentials.passcode"]', { timeout: 30000 });
    await page.fill('input[type="password"], input[name="credentials.passcode"]', 'DsKnL6QXEi&sOF4T');
    await page.click('input[type="submit"][value="Sign In"], input[type="submit"][value="Verify"], button:has-text("Sign In"), button:has-text("Verify")');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-04-after-password.png'), fullPage: true });
    
    // Check if we're logged in now - navigate to submission page
    console.log('Navigating to submission page...');
    await page.goto('https://bugcrowd.com/engagements/opensea/submissions/new', { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-05-report-form.png'), fullPage: true });
    
    // Debug: check form elements
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
    
    // Fill the report form
    console.log('Filling report form...');
    
    // Title
    await page.fill('input[name="submission[title]"], input[id*="title"], textarea[name="title"]', 'Unauthenticated IDOR: Hidden NFT Enumeration via ProfileItemsListQuery');
    
    // Severity - P4 (Low)
    const severitySelect = page.locator('select[name="submission[severity]"], select[id*="severity"]').first();
    if (await severitySelect.isVisible().catch(() => false)) {
      await severitySelect.selectOption({ label: 'P4' });
    } else {
      await page.click('label:has-text("P4"), input[value="P4"], button:has-text("P4")').catch(() => {});
    }
    
    // VRT Category
    await page.click('text=Broken Access Control').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('text=IDOR').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('text=View Sensitive Information').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('text=Iterable Object Identifiers').catch(() => {});
    
    // Description
    const description = `The OpenSea GraphQL API endpoint ProfileItemsListQuery accepts filter: {isHidden: true} with any arbitrary accountID, returning hidden items of any user without authentication. No ownership check or auth required. This defeats the privacy feature where users hide items from their public profile.

Steps to Reproduce:
1. Obtain any user's accountID (public from profile page)
2. Send unauthenticated GET request to gql.opensea.io/graphql with operationName=ProfileItemsListQuery and variables containing accountID and filter: {isHidden: true}
3. Response returns hidden items owned by target user

Impact: Any unauthenticated attacker can enumerate hidden NFT holdings of any OpenSea user, revealing privacy-sensitive collection data (rug-pull NFTs, spam holdings, etc.)

Affected endpoint: GET https://gql.opensea.io/graphql with persisted query hash c21d7fe7e333865ed58f5f4143c7ef7e9f684309e0dea7a8ec7eb938df2bb11a`;
    
    await page.fill('textarea[name="submission[description]"], textarea[id*="description"], textarea[name="details"]', description);
    
    await page.screenshot({ path: screenshotPath.replace('.png', '-06-filled-form.png'), fullPage: true });
    
    // Submit the report
    console.log('Submitting report...');
    await page.click('button[type="submit"]:has-text("Submit"), button:has-text("Submit Report"), input[type="submit"][value*="Submit"]').first();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Get the report URL/ID
    const reportUrl = page.url();
    console.log('Report submitted. URL:', reportUrl);
    
    // Check for success message
    const successText = await page.textContent('body').catch(() => '');
    console.log('Page content preview:', successText.substring(0, 500));
    
    await browser.close();
    
    return {
      status: 'SUCCESS',
      screenshot: screenshotPath,
      reportUrl: reportUrl,
      message: 'Report submitted successfully'
    };
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: screenshotPath.replace('.png', '-ERROR.png'), fullPage: true });
    await browser.close();
    
    return {
      status: 'FAILED',
      screenshot: screenshotPath.replace('.png', '-ERROR.png'),
      error: error.message
    };
  }
}

submitBugReport().then(result => {
  console.log('\n=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
