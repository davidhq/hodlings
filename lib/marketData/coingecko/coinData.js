import path from 'path';

import CoinGecko from 'coingecko-api';

import Cache from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function coinData({ coingeckoId, cacheDir }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, `${coingeckoId}.json`);
  const cache = new Cache({ cacheFilePath });
  const cachedData = cache.read();

  return new Promise((success, reject) => {
    if (cachedData) {
      success(cachedData);
      return;
    }

    CoinGeckoClient.coins
      .fetch(coingeckoId, { tickers: false, community_data: false, developer_data: false, localization: false })
      .then(({ data }) => {
        cache.write(data);
        success(data);
      })
      .catch(reject);
  });
}

export default coinData;
