import https from 'https';

https.get('https://signal-kappa-ten.vercel.app/', (res) => {
    let html = '';
    res.on('data', d => html += d);
    res.on('end', () => {
        const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            const jsUrl = 'https://signal-kappa-ten.vercel.app' + match[1];
            console.log('Found JS file:', jsUrl);
            https.get(jsUrl, (jsRes) => {
                let js = '';
                jsRes.on('data', d => js += d);
                jsRes.on('end', () => {
                    const hasLocalhost = js.includes('http://localhost:5678');
                    const hasFastest = js.includes('n8n-fastest');
                    console.log('Contains localhost:5678?', hasLocalhost);
                    console.log('Contains n8n-fastest?', hasFastest);
                });
            });
        } else {
            console.log('Could not find JS bundle in HTML.');
        }
    });
});
