const { GoogleAuth } = require('google-auth-library');
const https = require('https');

async function getRules() {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const projectId = 'igreja-iecp-sbc';

  const url = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firebaserules.googleapis.com',
      path: `/v1/projects/${projectId}/releases/cloud.firestore`,
      headers: { Authorization: `Bearer ${token.token}` }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        // Get the ruleset name
        const rulesetName = json.rulesetName;
        console.log('Ruleset:', rulesetName);
        
        // Now get the ruleset content
        const rulesetPath = rulesetName.replace('projects/igreja-iecp-sbc/', '');
        const opts2 = {
          hostname: 'firebaserules.googleapis.com',
          path: `/v1/${rulesetName}`,
          headers: { Authorization: `Bearer ${token.token}` }
        };
        
        https.get(opts2, (res2) => {
          let data2 = '';
          res2.on('data', c => data2 += c);
          res2.on('end', () => {
            const rs = JSON.parse(data2);
            if (rs.source && rs.source.files) {
              rs.source.files.forEach(f => {
                console.log('\n=== REGRAS FIRESTORE ===');
                console.log(f.content);
              });
            } else {
              console.log(JSON.stringify(rs, null, 2));
            }
            resolve();
          });
        }).on('error', reject);
      });
    }).on('error', reject);
  });
}

getRules().catch(console.error);
