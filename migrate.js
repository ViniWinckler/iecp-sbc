import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\25171007\\OneDrive - SESISENAISP - Escolas\\Web App Igreja IECP SBC';
const destDir = 'C:\\Users\\25171007\\.gemini\\antigravity\\scratch\\igreja-app';

async function copyFiles() {
  console.log('Copying config files...');
  
  const filesToCopy = [
    'package.json',
    'tailwind.config.js',
    'postcss.config.js',
    'vite.config.js',
    'jsconfig.json',
    'components.json',
    'index.html',
    'src/App.jsx',
    'src/main.jsx',
    'src/index.css'
  ];

  for (const file of filesToCopy) {
    const srcFile = path.join(srcDir, file + '.txt');
    const destFile = path.join(destDir, file);
    if (fs.existsSync(srcFile)) {
      fs.cpSync(srcFile, destFile, { force: true });
      console.log(`Copied ${file}`);
    } else {
      console.log(`Missing ${srcFile}`);
    }
  }

  const foldersToCopy = [
    'src/components',
    'src/lib',
    'src/hooks',
    'src/utils',
    'src/pages',
    'src/api'
  ];

  for (const folder of foldersToCopy) {
    const srcFolder = path.join(srcDir, folder);
    const destFolder = path.join(destDir, folder);
    if (fs.existsSync(srcFolder)) {
      copyDirRecursiveWithTxtStrip(srcFolder, destFolder);
      console.log(`Copied folder ${folder}`);
    }
  }

  console.log('Migration step 1 complete.');
}

function copyDirRecursiveWithTxtStrip(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    let destName = entry.name;
    if (destName.endsWith('.txt')) {
      destName = destName.slice(0, -4);
    }
    const destPath = path.join(dest, destName);
    
    if (entry.isDirectory()) {
      copyDirRecursiveWithTxtStrip(srcPath, destPath);
    } else {
      fs.cpSync(srcPath, destPath, { force: true });
    }
  }
}

copyFiles().catch(console.error);
