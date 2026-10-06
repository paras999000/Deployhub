import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

try {
  const staticSrc = path.join(__dirname, '..', '.next', 'static');
  const staticDest = path.join(__dirname, '..', '.next', 'standalone', '.next', 'static');
  copyFolderSync(staticSrc, staticDest);

  const publicSrc = path.join(__dirname, '..', 'public');
  const publicDest = path.join(__dirname, '..', '.next', 'standalone', 'public');
  copyFolderSync(publicSrc, publicDest);

  console.log('✓ Standalone static assets copied successfully');
} catch (err) {
  console.error('Error copying standalone assets:', err);
}
