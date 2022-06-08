import path from 'path';

import CoinGecko from './api/coinGecko.js';

import { sortCoins } from '../../helpers/helpers.js';

import Cache from '../cache.js';

const CoinGeckoClient = new CoinGecko();

// 8h cache for coin list (elsewhere we have 5min)
function coinList({ cacheDir, cacheTtl = 8 * 60 * 60 }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, '_coinList.json');
  const cache = new Cache({ cacheFilePath, ttl: cacheTtl });

  const cachedData = cache.read();

  return new Promise((success, reject) => {
    if (cachedData) {
      success(sortCoins(cachedData)); // should be already sorted but keep it here in case sorting function changes
      return;
    }

    CoinGeckoClient.coins
      .list()
      .then(({ data }) => {
        const sortedList = sortCoins(data); // sort by coin ids and name
        cache.write(sortedList);
        success(sortedList);
      })
      .catch(reject);
  });
}

export default coinList;
