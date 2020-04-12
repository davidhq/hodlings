import fs from 'fs';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function makeDataDir(subdir) {
  let dir = path.join(__dirname, '../data');

  if (subdir) {
    dir = path.join(dir, subdir);
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  return dir;
}

const dataDir = makeDataDir();
const cacheDir = makeDataDir('cache');

export { dataDir, cacheDir };
