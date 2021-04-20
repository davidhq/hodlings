import path from 'path';

import CoinGecko from 'coingecko-api';

import { sortCoinlist } from '../../helpers.js';

import { readCache, writeCache } from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function coinList({ cacheDir }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, '_coinList.json');
  const cachedData = readCache(cacheFilePath);

  return new Promise((success, reject) => {
    if (cachedData) {
      success(sortCoinlist(cachedData)); // should be already sorted but keep it here in case sorting function changes
      return;
    }

    CoinGeckoClient.coins
      .list()
      .then(({ data }) => {
        const sortedList = sortCoinlist(data); // sort by coin ids and name
        writeCache(cacheFilePath, sortedList);
        success(sortedList);
      })
      .catch(reject);
  });
}

export default coinList;
