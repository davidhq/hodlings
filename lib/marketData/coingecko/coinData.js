import path from 'path';

import colors from 'chalk';

import CoinGecko from './api/coinGecko.js';

import Cache from '../cache.js';

const CoinGeckoClient = new CoinGecko();

function coinData({ coingeckoId, cacheDir, displayFetchingNotice }) {
  const cacheFilePath = cacheDir && path.join(cacheDir, `${coingeckoId}.json`);
  const cache = new Cache({ cacheFilePath });
  const cachedData = cache.read();

  return new Promise((success, reject) => {
    if (cachedData) {
      // if (displayFetchingNotice) {
      //   console.log(colors.gray(` Using cached data: ${colors.gray(coingeckoId)}`));
      // }

      success(cachedData);
      return;
    }

    if (displayFetchingNotice) {
      console.log(colors.gray(`Fetching coin data: ${colors.magenta(coingeckoId)}`));
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
