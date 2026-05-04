import fs from 'fs';
import path from 'path';

const dbPath = './src/services/db.js';
const outDir = './src/services/db';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let content = fs.readFileSync(dbPath, 'utf8');

// The file has segments separated by:
// // =============================================
// // NAME
// // =============================================

const sections = [];
const lines = content.split('\n');

let currentSectionName = 'header';
let currentSectionLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('// =============================================')) {
    const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
    if (nextLine.startsWith('// ') && lines[i + 2] && lines[i + 2].startsWith('// =============================================')) {
      // New section
      sections.push({ name: currentSectionName, lines: currentSectionLines });
      currentSectionName = nextLine.replace('//', '').trim();
      currentSectionLines = [line, nextLine, lines[i+2]];
      i += 2;
      continue;
    }
  }
  currentSectionLines.push(line);
}
sections.push({ name: currentSectionName, lines: currentSectionLines });

// Now write out the sections
// header contains the imports and COLLECTIONS.
const header = sections.find(s => s.name === 'header').lines.join('\n');
const importStart = header.indexOf('import {');
const importEnd = header.indexOf('../firebase.js\';') + 16;
const headerImports = header.substring(importStart, importEnd) + "\nimport { COLLECTIONS, isAdmin, ADMIN_EMAIL } from './index.js';";

let indexExports = `export { COLLECTIONS, isAdmin } from './index.js';\n`;
let newDbJs = `import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const ADMIN_EMAIL = 'vini.wincklerferreira@gmail.com';

export function isAdmin(userData) {
  return userData && userData.Email === ADMIN_EMAIL && userData.Nivel_Acesso === 'Admin';
}

export const COLLECTIONS = {
  USUARIOS: 'Usuarios',
  MINISTERIOS: 'Ministerios',
  CONVITES_MEMBROS: 'Convites_Membros',
  ESCALAS: 'Escalas',
  ESCALAS_FUNCOES: 'Escalas_Funcoes',
  AVISOS: 'Avisos',
  PROJETOS: 'Projetos',
  TAREFAS_CHAMADOS: 'Tarefas_Chamados',
  EVENTOS_PUBLICOS: 'Eventos_Publicos',
  BANNERS_HOME: 'Banners_Home'
};\n\n`;

const groupMap = {
  'USUARIOS': 'usuarios.js',
  'MINISTERIOS': 'ministerios.js',
  'CONVITES E MEMBROS': 'ministerios.js',
  'ESCALAS & FUNCOES': 'escalas.js',
  'AVISOS': 'eventos.js',
  'PROJETOS & TAREFAS': 'projetos.js',
  'DASHBOARD EXTENSIONS': 'usuarios.js',
  'ADMIN FIXES (Opcional)': 'usuarios.js',
  'EVENTOS PUBLICOS & BANNERS': 'eventos.js',
  'ADMIN STATS': 'usuarios.js'
};

const moduleContent = {};

for (const sec of sections) {
  if (sec.name === 'header' || sec.name === 'Collection Names (matching Mdulo 5 exactly)' || sec.name === 'Collection Names (matching Módulo 5 exactly)') continue;
  
  const targetFile = groupMap[sec.name] || 'misc.js';
  if (!moduleContent[targetFile]) {
    moduleContent[targetFile] = headerImports + "\n\n";
  }
  moduleContent[targetFile] += sec.lines.join('\n') + "\n";
  
  // Extract export functions to put in db.js proxy
  const funcRegex = /export (?:async )?function ([a-zA-Z0-9_]+)/g;
  let match;
  const funcs = [];
  while ((match = funcRegex.exec(sec.lines.join('\n'))) !== null) {
    funcs.push(match[1]);
  }
  if (funcs.length > 0) {
    newDbJs += `export {\n  ${funcs.join(',\n  ')}\n} from './db/${targetFile.replace('.js', '')}';\n`;
  }
}

for (const [file, content] of Object.entries(moduleContent)) {
  // Fix imports
  let finalContent = content.replace(/from '\.\.\/firebase\.js'/g, "from '../../firebase.js'");
  fs.writeFileSync(path.join(outDir, file), finalContent);
}

fs.writeFileSync('./src/services/db/index.js', header.split('\n').filter(l => l.includes('COLLECTIONS') || l.includes('isAdmin') || l.includes('ADMIN_EMAIL')).join('\n'));

// Write db.js
fs.writeFileSync(dbPath, newDbJs);
console.log('Refactoring complete!');
