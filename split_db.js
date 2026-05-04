import fs from 'fs';

const content = fs.readFileSync('src/services/db.js', 'utf8');

const targetFiles = {
  usuarios: [
    'getUser', 'getUserByEmail', 'createUser', 'updateUser', 'getAllUsers',
    'updateUserRole', 'deleteUser', 'getUserCount'
  ],
  ministerios: [
    'getMinisterios', 'getMinisterio', 'createMinisterio', 'updateMinisterio', 'deleteMinisterio',
    'getConvitesByEmail', 'getConvitesPendentes', 'getConvitesByMinisterio', 'createConvite', 'updateConviteStatus',
    'getMinisteriosDoUsuario', 'getMembrosMinisterio', 'getMinisterioCount'
  ],
  escalas: [
    'getEscalas', 'updateEscala', 'deleteEscala', 'getFuncoesByEscala', 'createFuncaoEscala', 'confirmarPresenca',
    'createEscala', 'getEscalasDoMinisterio', 'responderEscala', 'getEscalasDoMembro'
  ],
  projetos: [
    'createProjeto', 'getProjetosDoLider', 'getProjeto', 'getAllProjetos', 'deleteProjeto',
    'createTarefa', 'getTarefasPorProjeto', 'updateTarefaStatus', 'deleteTarefa', 'autoUpdateProjectProgress'
  ],
  eventos: [
    'getAvisos', 'createAviso', 'deleteAviso',
    'getEventosPublicos', 'createEventoPublico', 'deleteEventoPublico',
    'getBannersAtivos', 'createBanner', 'getAllBanners', 'deleteBanner'
  ]
};

// Start parsing the AST or just regex matching blocks.
// A block starts with `export function` or `export async function` and ends before the next export or EOF.
// Wait, regex might fail on curly braces. But we can split by `export `
const parts = content.split(/\nexport (?=(?:async )?function)/);

const header = parts[0];

const modules = {
  usuarios: [],
  ministerios: [],
  escalas: [],
  projetos: [],
  eventos: []
};

for (let i = 1; i < parts.length; i++) {
  const part = "export " + parts[i];
  const match = part.match(/export (?:async )?function ([a-zA-Z0-9_]+)/);
  if (match) {
    const funcName = match[1];
    let found = false;
    for (const [mod, funcs] of Object.entries(targetFiles)) {
      if (funcs.includes(funcName)) {
        modules[mod].push(part);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`Unmapped function: ${funcName}, putting in usuarios.js`);
      modules.usuarios.push(part);
    }
  }
}

const imports = `import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, isAdmin, ADMIN_EMAIL } from './index.js';\n\n`;

for (const [mod, chunks] of Object.entries(modules)) {
  fs.writeFileSync(`src/services/db/${mod}.js`, imports + chunks.join('\n\n'));
}

// Generate new db.js
let newDbJs = header + '\n';
for (const [mod, funcs] of Object.entries(targetFiles)) {
  newDbJs += `export {\n  ${funcs.join(',\n  ')}\n} from './db/${mod}.js';\n`;
}

fs.writeFileSync('src/services/db.js', newDbJs);
fs.writeFileSync('src/services/db/index.js', header.split('\n').filter(l => l.includes('COLLECTIONS') || l.includes('isAdmin') || l.includes('ADMIN_EMAIL')).join('\n') + '\nexport const ADMIN_EMAIL = "vini.wincklerferreira@gmail.com";\n');

console.log('Split successful based on function names.');
