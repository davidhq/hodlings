import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

import { globalData, coinList, singleCoinData, identifyCoin } from './coingecko/index.js';

import { sortCoinlist } from '../helpers.js';

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

function mapHodlingsPortfolioToCoingecko({ hodlingsPortfolioIdentifiers, coingeckoCoinList }) {
  const coinIDs = [];
  const problems = [];

  for (const identifier of hodlingsPortfolioIdentifiers) {
    // identifier from ~/.hodlings portfolio
    // find a matching entry in fetched list of coins based on our id and symbol in portfolio

    const coin = identifyCoin(coingeckoCoinList, identifier);

    if (coin) {
      coinIDs.push({ coingeckoId: coin.id, hodlingsIdentifier: identifier });
    } else {
      problems.push(chalk.red(`⚠️  Portfolio entry ${chalk.yellow(identifier)} couldn't be identified in CoinGecko API data and was excluded`));
    }
  }

  return { coinIDs, problems };
}

function constructFetchingPromises({ coinIDs, baseCurrency, cacheDir, progress }) {
  return coinIDs.map(
    ({ coingeckoId, hodlingsIdentifier }) =>
      new Promise((success, reject) => {
        singleCoinData({ coingeckoId, cacheDir })
          .then(coinData => {
            try {
              const { name, symbol, id } = coinData;

              progress.tick();

              const dataPoints = extractMarketDataPoints(coinData.market_data, baseCurrency);

              success({ ...{ symbol: symbol.toUpperCase(), name, id, currency: baseCurrency, hodlingsIdentifier }, ...dataPoints });
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

function fetchMarketData({ baseCurrency, hodlingsPortfolioIdentifiers, cacheDir, progress }) {
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

            const { coinIDs, problems } = mapHodlingsPortfolioToCoingecko({ hodlingsPortfolioIdentifiers, coingeckoCoinList });

            // unknown coins in our portfolio - move progress bar for those now since fetching won't move it
            for (let i = 0; i < problems.length; i++) {
              progress.tick();
            }

            // fetch data for each coin
            const promises = constructFetchingPromises({ coinIDs, baseCurrency, cacheDir, progress });

            Promise.all(promises)
              .then(coinsMarketData => {
                const validCoins = sortCoinlist(coinsMarketData).filter(({ price }) => price);
                const invalidCoins = coinsMarketData.filter(({ price }) => !price);

                for (const coin of invalidCoins) {
                  problems.push(
                    chalk.red(
                      `⚠️  Excluded portfolio entry ${chalk.yellow(coin.hodlingsIdentifier)} because CoinGecko api entry for it (${chalk.yellow(
                        coin.id
                      )} / ${chalk.yellow(coin.name)}) had missing price - ${chalk.white('if this is the wrong coin try using its name instead of the symbol')}`
                    )
                  );
                }

                const globalData = extractGlobalData({ _globalData, coinsMarketData, baseCurrency });
                success({ globalData, coinsMarketData: validCoins, problems }); // identifyCoin expects same sorting of the list in all cases
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

export default fetchMarketData;
