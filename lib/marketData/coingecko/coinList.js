import path from 'path';

import CoinGecko from 'coingecko-api';

import { readCache, writeCache } from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function coinList({ cacheDir }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, '_coinList.json');
  const cachedData = readCache(cacheFilePath);

  return new Promise((success, reject) => {
    if (cachedData) {
      success(cachedData);
      return;
    }

    CoinGeckoClient.coins
      .list()
      .then(({ data }) => {
        writeCache(cacheFilePath, data);
        success(data);
      })
      .catch(reject);
  });
}

export default coinList;
