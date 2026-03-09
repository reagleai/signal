import https from 'https';

https.get('https://signal-kappa-ten.vercel.app/', (res) => {
    let html = '';
    res.on('data', d => html += d);
    res.on('end', () => {
        const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            const jsUrl = 'https://signal-kappa-ten.vercel.app' + match[1];
            https.get(jsUrl, (jsRes) => {
                let js = '';
                jsRes.on('data', d => js += d);
                jsRes.on('end', () => {
                    const hasRangeLabel = js.includes('rangeLabel');
                    const hasSyncTime = js.includes('lastGlobalSyncTime');
                    console.log('Is the old rangeLabel crash still in Vercel JS?', hasRangeLabel);
                    console.log('Does Vercel JS have the new lastGlobalSyncTime var?', hasSyncTime);
                });
            });
        }
    });
});
