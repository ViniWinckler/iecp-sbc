import fs from 'fs';

const code = fs.readFileSync('bundle.js', 'utf8');

const searchStrings = [
  'Uma comunidade',
  'viva em Cristo',
  'Acesse escalas, avisos e projetos',
  'Nossa Igreja',
  'Faça parte da família',
  'Próximos Eventos'
];

let report = '';
for (const str of searchStrings) {
  const idx = code.indexOf(str);
  if (idx !== -1) {
     report += `\n\n=== FOUND: ${str} ===\n`;
     report += code.substring(Math.max(0, idx - 150), idx + 150);
  } else {
     report += `\n\n=== NOT FOUND: ${str} ===\n`;
  }
}

fs.writeFileSync('extracted2.txt', report);
console.log('Search complete. Results in extracted2.txt');
