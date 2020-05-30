import fs from 'fs';

import os from 'os';

const cacheDataVersion = 'coingecko_api_v3';
//const cacheValidTime = os.hostname() == 'eclipse_' ? 86400 / 2 : 300; // 5 min
const cacheValidTime = 300; // 5 min

function readCache(cacheFilePath) {
  // if no cacheFilePath, do nothing... comes handy from the "cache api / usage" side
  if (cacheFilePath && fs.existsSync(cacheFilePath)) {
    try {
      const { mtimeMs } = fs.statSync(cacheFilePath);

      // cache still valid
      if ((Date.now() - mtimeMs) / 1000 < cacheValidTime) {
        const cachedData = JSON.parse(fs.readFileSync(cacheFilePath));
        const { version, data } = cachedData;
        if (version == cacheDataVersion) {
          return data;
        }
      }
    } catch {
      // we do nothing
    }
  }
}

function writeCache(cacheFilePath, data) {
  if (cacheFilePath) {
    // if no cacheFilePath, do nothing... comes handy from the "cache api / usage" side
    fs.writeFileSync(cacheFilePath, JSON.stringify({ version: cacheDataVersion, timestamp: Date.now(), data }, null, 2));
  }
}

export { readCache, writeCache };
