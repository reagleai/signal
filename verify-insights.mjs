import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    let hasErrors = false;
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`BROWSER ERROR: ${msg.text()}`);
            hasErrors = true;
        }
    });
    page.on('pageerror', err => {
        console.log(`PAGE ERROR: ${err.message}`);
        hasErrors = true;
    });

    console.log('Navigating to Vercel URL...');
    await page.goto('https://signal-kappa-ten.vercel.app/');
    await page.waitForSelector('h1');

    console.log('Switching to AI Insights tab...');
    await page.evaluate(() => {
        const navs = Array.from(document.querySelectorAll('button, a'));
        const aiInsightNav = navs.find(n => n.textContent.includes('AI Insights'));
        if (aiInsightNav) aiInsightNav.click();
    });

    console.log('Waiting for render...');
    await new Promise(r => setTimeout(r, 2000));

    console.log('Taking screenshot...');
    const screenshotPath = 'test-insights.png';
    await page.screenshot({ path: screenshotPath });

    const content = await page.evaluate(() => document.body.innerText);

    if (content.includes('5 problems synthesized')) {
        console.log('✅ AI Insights rendered successfully!');
    } else {
        console.log('❌ AI Insights did not render the expected text.');
    }

    if (!hasErrors) {
        console.log('✅ No browser console errors.');
    }

    await browser.close();
})();
