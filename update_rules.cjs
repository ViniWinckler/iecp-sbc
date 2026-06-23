const { GoogleAuth } = require('google-auth-library');
const https = require('https');

const NEW_RULES = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Usuarios: qualquer autenticado pode ler o próprio doc; admin pode tudo
    match /Usuarios/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == uid;
      allow update: if request.auth != null && (request.auth.uid == uid || request.auth.token.email == 'vini.wincklerferreira@gmail.com');
      allow delete: if request.auth != null && request.auth.token.email == 'vini.wincklerferreira@gmail.com';
    }

    // Todas as outras coleções: autenticado pode ler; escrita exige autenticação
    match /{collection}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}`;

const PROJECT_ID = 'igreja-iecp-sbc';

async function updateRules() {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  // 1. Create new ruleset
  const rulesetBody = JSON.stringify({
    source: {
      files: [{ name: 'firestore.rules', content: NEW_RULES }]
    }
  });

  const newRuleset = await makeRequest(token.token, 'POST',
    `/v1/projects/${PROJECT_ID}/rulesets`,
    rulesetBody
  );

  console.log('Novo ruleset criado:', newRuleset.name);

  // 2. Update the release to point to the new ruleset
  const releaseBody = JSON.stringify({
    name: `projects/${PROJECT_ID}/releases/cloud.firestore`,
    rulesetName: newRuleset.name
  });

  const release = await makeRequest(token.token, 'PUT',
    `/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
    releaseBody
  );

  console.log('Release atualizado:', release.name);
  console.log('\n✅ Regras do Firestore atualizadas com sucesso!');
}

function makeRequest(token, method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firebaserules.googleapis.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body || '')
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            console.error('Erro HTTP', res.statusCode, json);
            reject(json);
          } else {
            resolve(json);
          }
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

updateRules().catch(console.error);
