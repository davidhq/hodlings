import path from 'path';

import CoinGecko from 'coingecko-api';

import { readCache, writeCache } from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function globalData({ cacheDir }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, '_globalData.json');
  const cachedData = readCache(cacheFilePath);

  return new Promise((success, reject) => {
    if (cachedData) {
      success(cachedData);
      return;
    }

    CoinGeckoClient.global()
      .then(({ data }) => {
        writeCache(cacheFilePath, data.data);
        success(data.data);
      })
      .catch(reject);
  });
}

export default globalData;
