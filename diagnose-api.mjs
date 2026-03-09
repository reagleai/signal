import https from 'https';

console.log('Fetching live insights data...');
https.get('https://n8n-fastest.protonaiagents.com/webhook/signal-insights', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('StatusCode:', res.statusCode);
            console.log('Keys in response:', Object.keys(json));
            if (json.masterProblems) {
                console.log(`Found ${json.masterProblems.length} master problems.`);
                const p1 = json.masterProblems[0];
                if (p1) {
                    console.log('Problem 1 keys:', Object.keys(p1));
                    console.log('sources is array?', Array.isArray(p1.sources));
                    console.log('reasonCodes is array?', Array.isArray(p1.reasonCodes));
                    console.log('citationIds is array?', Array.isArray(p1.citationIds));
                    console.log('subReasonDrivers is array?', Array.isArray(p1.subReasonDrivers));
                    console.log('nodeProblems is object?', typeof p1.nodeProblems === 'object');
                }
            } else {
                console.log('No masterProblems array found in response.');
            }
        } catch (e) {
            console.log('Response is not valid JSON:', e.message);
            console.log(data.substring(0, 200) + '...');
        }
    });
}).on('error', err => {
    console.log('Fetch error:', err.message);
});
