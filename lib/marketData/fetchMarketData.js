import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

import { globalData, coinList, singleCoinData } from './coingecko/index.js';

function extractGlobalData({ _globalData, coinsMarketData, baseCurrency }) {
  const data = { totalMarketCap: _globalData.total_market_cap[baseCurrency] };

  if (coinsMarketData.find(d => !d.symbol)) {
    console.log(chalk.red('Missing data in coingecko api'));
    console.log('These are the entries without symbol defined:');
    console.log(coinsMarketData.filter(d => !d.symbol));
    console.log(chalk.gray('Please report this issue to the author of hodlings library.'));
    console.log('coinMarketData:');
    console.log(coinsMarketData);
  }

  // occasionally throws an exception: cannot read property toLowerCase() of undefined
  const btc = coinsMarketData.find(({ symbol }) => symbol.toLowerCase() == 'btc');
  const eth = coinsMarketData.find(({ symbol }) => symbol.toLowerCase() == 'eth');

  return { ...data, ...{ eth, btc } };
}

function extractMarketDataPoints(marketData, baseCurrency) {
  if (marketData) {
    const price = marketData.current_price[baseCurrency];
    const priceBTC = marketData.current_price.btc;
    const priceChange1h = marketData.price_change_percentage_1h_in_currency[baseCurrency];
    const priceChange24h = marketData.price_change_percentage_24h_in_currency[baseCurrency];
    const priceChange7d = marketData.price_change_percentage_7d_in_currency[baseCurrency];
    const marketCap = marketData.market_cap[baseCurrency];
    const totalVolume = marketData.total_volume[baseCurrency];
    const rank = marketData.market_cap_rank;

    return { price, priceBTC, priceChange1h, priceChange24h, priceChange7d, marketCap, totalVolume, rank };
  }
}

function mapCoinSymbolsToCoingeckoIDs({ coinSymbols, coingeckoCoinList }) {
  const results = [];

  for (const symbol of coinSymbols) {
    // find a matching entry in fetched list of coins based on our id and symbol in portfolio

    const _symbol = symbol.toLowerCase();

    // priority 1: both id and symbol match
    //
    // we are covering this use case for symbol = 'musd'
    // {
    //   "id": "musd",
    //   "symbol": "musd",
    //   "name": "mStable USD"
    // }
    // {
    //   "id": "master-usd",
    //   "symbol": "musd",
    //   "name": "MASTER USD"
    // },
    //
    // we have to be sure we match the mStable USD
    let coin = coingeckoCoinList.find(obj => obj.symbol.toLowerCase() == _symbol && obj.id.toLowerCase() == _symbol);

    // priority 2: symbol matches
    // most coins will fall here
    if (!coin) {
      coin = coingeckoCoinList.find(obj => obj.symbol.toLowerCase() == _symbol);
    }

    // priority 3: id matches
    // exotic coins: ability to match 'master-usd' for example
    if (!coin) {
      coin = coingeckoCoinList.find(obj => obj.id.toLowerCase() == _symbol);
    }

    if (coin) {
      results.push(coin.id);
    } else {
      console.log(`Warning: unknown symbol - ${symbol}`);
    }
  }

  return results;
}

function constructFetchingPromises({ coingeckoIDs, baseCurrency, cacheDir, progress }) {
  return coingeckoIDs.map(
    coinId =>
      new Promise((success, reject) => {
        singleCoinData({ coinId, cacheDir })
          .then(coinData => {
            try {
              const { name, symbol } = coinData;

              progress.tick();

              const dataPoints = extractMarketDataPoints(coinData.market_data, baseCurrency);

              success({ ...{ symbol: symbol.toUpperCase(), name, currency: baseCurrency }, ...dataPoints });
            } catch (e) {
              console.log('Error:');
              console.log(e);
              reject(e);
            }
          })
          .catch(reject);
      })
  );
}

function fetchMarketData({ baseCurrency, coinSymbols, cacheDir, progress }) {
  cacheDir = cacheDir && path.join(cacheDir, 'coingecko');

  if (cacheDir && !fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  return new Promise((success, reject) => {
    // fetch global market data
    globalData({ cacheDir })
      .then(_globalData => {
        progress.tick();

        // fetch list of all available coins
        coinList({ cacheDir })
          .then(coingeckoCoinList => {
            progress.tick();

            const coingeckoIDs = mapCoinSymbolsToCoingeckoIDs({ coinSymbols, coingeckoCoinList });

            // fetch data for each coin
            const promises = constructFetchingPromises({ coingeckoIDs, baseCurrency, cacheDir, progress });

            Promise.all(promises)
              .then(coinsMarketData => {
                const globalData = extractGlobalData({ _globalData, coinsMarketData, baseCurrency });
                success({ globalData, coinsMarketData });
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

export default fetchMarketData;
