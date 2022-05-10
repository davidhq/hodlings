import path from 'path';

import CoinGecko from './api/coinGecko.js';

import Cache from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function globalData({ cacheDir }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, '_globalData.json');
  const cache = new Cache({ cacheFilePath });
  const cachedData = cache.read();

  //console.log(cachedData);

  return new Promise((success, reject) => {
    if (cachedData) {
      success(cachedData);
      return;
    }

    CoinGeckoClient.global()
      .then(({ data }) => {
        cache.write(data.data);
        success(data.data);
      })
      .catch(reject);
  });
}

export default globalData;
