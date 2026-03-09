import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to local dev server (assuming it's running on 5173)
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // 1. Initial State
    const initialHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('INITIAL RAGS INDEXED:', initialHtml.includes('14') ? '14 (Mock)' : 'Not 14');

    // 2. Click Resync
    console.log('Clicking resync...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resync = btns.find(b => b.textContent.includes('Re-sync'));
        if (resync) resync.click();
    });

    // Wait for 3 seconds for fetch and render
    await new Promise(r => setTimeout(r, 3000));

    // 3. Check State
    const afterFetchHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('AFTER FETCH RAGS INDEXED 14?:', afterFetchHtml.includes('>14<'));
    console.log('AFTER FETCH RAGS INDEXED 5?:', afterFetchHtml.includes('>5<'));

    // 4. Reload Page
    console.log('Reloading page...');
    await page.reload();
    await page.waitForSelector('h1');

    // 5. Final State
    const finalHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('AFTER RELOAD RAGS INDEXED 5 (should be 5 if cached)?:', finalHtml.includes('>5<'));
    console.log('AFTER RELOAD RAGS INDEXED 14 (BUG if 14)?:', finalHtml.includes('>14<'));

    await browser.close();
})();
