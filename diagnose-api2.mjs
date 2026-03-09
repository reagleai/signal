import https from 'https';

console.log('Fetching live insights data...');
https.get('https://n8n-fastest.protonaiagents.com/webhook/signal-insights', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2).substring(0, 500));
        } catch (e) { }
    });
});
