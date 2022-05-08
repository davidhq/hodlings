import fs from 'fs';

const cacheDataVersion = 'coingecko_api_v3';

class Cache {
  // default ttl = 5min
  constructor({ cacheFilePath, ttl = 300 }) {
    this.cacheFilePath = cacheFilePath;
    this.ttl = ttl;
    //this.ttl = os.hostname() == 'eclipse_' ? 86400 / 2 : 300; // 5 min
  }

  read() {
    // if no cacheFilePath, do nothing... comes handy from the "cache api / usage" side
    if (this.cacheFilePath && fs.existsSync(this.cacheFilePath)) {
      try {
        const { mtimeMs } = fs.statSync(this.cacheFilePath);

        // cache still valid
        if ((Date.now() - mtimeMs) / 1000 < this.ttl) {
          const cachedData = JSON.parse(fs.readFileSync(this.cacheFilePath));
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

  write(data) {
    if (this.cacheFilePath) {
      // if no cacheFilePath, do nothing... comes handy from the "cache api / usage" side
      fs.writeFileSync(this.cacheFilePath, JSON.stringify({ version: cacheDataVersion, timestamp: Date.now(), data }, null, 2));
    }
  }
}

export default Cache;
