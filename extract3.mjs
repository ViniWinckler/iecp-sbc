import fs from 'fs';

const code = fs.readFileSync('bundle.js', 'utf8');

const regex = /<section[\s\S]*?<\/section>/g;
let match;
let count = 0;
let report = '';
while ((match = regex.exec(code)) !== null) {
  report += `\n\n=== SECTION ${count++} ===\n`;
  report += match[0];
  if (count > 20) break; // limit to 20 sections
}

fs.writeFileSync('extracted3.txt', report);
console.log('Extracted sections to extracted3.txt');
