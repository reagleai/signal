import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Catch console logs and errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`BROWSER ERROR: ${msg.text()}`);
        } else {
            console.log(`BROWSER LOG: ${msg.text()}`);
        }
    });
    page.on('pageerror', err => {
        console.log(`PAGE ERROR: ${err.message}`);
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

    await new Promise(r => setTimeout(r, 2000));

    console.log('Done.');
    await browser.close();
})();
