import fs from 'fs';

const base = 'https://iecp-sbc.web.app';
const bundleUrl = base + '/assets/index-BEUxlcrs.js';

console.log('Downloading bundle...');
fetch(bundleUrl)
  .then(r => r.text())
  .then(code => {
    fs.writeFileSync('bundle.js', code);
    console.log('Bundle saved! Size:', code.length, 'chars');

    // Extract HTML template sections
    const sections = {
      home: extractBetween(code, 'renderHomePublicPage', 200),
      navbar: extractBetween(code, 'pub-navbar', 150),
      login: extractBetween(code, 'login-page', 150),
      contact: extractBetween(code, 'renderContactPage', 150),
      events: extractBetween(code, 'renderEventsPage', 150),
      about: extractBetween(code, 'renderAboutUsPage', 150),
    };

    let report = '';
    for (const [name, snippet] of Object.entries(sections)) {
      report += `\n\n=== ${name.toUpperCase()} ===\n${snippet}`;
    }
    fs.writeFileSync('extracted.txt', report);
    console.log('Extracted sections saved to extracted.txt');
  });

function extractBetween(str, keyword, chars) {
  const idx = str.indexOf(keyword);
  if (idx === -1) return `[NOT FOUND: ${keyword}]`;
  return str.substring(Math.max(0, idx - 50), idx + chars);
}
