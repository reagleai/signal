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
                    console.log('Contains signal-sources-cache?', js.includes('signal-sources-cache'));
                    console.log('Contains signal-sync-cache?', js.includes('signal-sync-cache'));
                });
            });
        }
    });
});
