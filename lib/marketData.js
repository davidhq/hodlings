import path from 'path';
import fs from 'fs';

import os from 'os';

import EventEmitter from 'events';

import CoinGecko from 'coingecko-api';

const CoinGeckoClient = new CoinGecko();

function extractGlobalData({ _globalData, coinData, baseCurrency }) {
  const data = { totalMarketCap: _globalData.total_market_cap[baseCurrency] };

  const btc = coinData.find(({ symbol }) => symbol.toLowerCase() == 'btc');
  const eth = coinData.find(({ symbol }) => symbol.toLowerCase() == 'eth');

  return { ...data, ...{ eth, btc } };
}

const cacheDataVersion = 'coingecko_api_v3';
const cacheValidTime = os.hostname() == 'eclipse2' ? 86400 : 300; // 5 min

function readCache(cacheFilePath) {
  if (fs.existsSync(cacheFilePath)) {
    try {
      const { mtimeMs } = fs.statSync(cacheFilePath);

      // cache still valid
      if ((Date.now() - mtimeMs) / 1000 < cacheValidTime) {
        const cachedData = JSON.parse(fs.readFileSync(cacheFilePath));
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

function writeCache(cacheFilePath, data) {
  fs.writeFileSync(cacheFilePath, JSON.stringify({ version: cacheDataVersion, timestamp: Date.now(), data }, null, 2));
}

function globalData(cacheDir) {
  const cacheFilePath = path.join(cacheDir, '_globalData.json');
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

function coinList(cacheDir) {
  const cacheFilePath = path.join(cacheDir, '_coinList.json');
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

function coinData(coinId, cacheDir) {
  const cacheFilePath = path.join(cacheDir, `${coinId}.json`);
  const cachedData = readCache(cacheFilePath);

  return new Promise(success => {
    if (cachedData) {
      success(cachedData);
      return;
    }

    CoinGeckoClient.coins
      .fetch(coinId, {}) // todo: reduce request size, limit what we actually need
      .then(({ data }) => {
        writeCache(cacheFilePath, data);
        success(data);
      })
      .catch(error => success({ error }));
  });
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

class MarketData extends EventEmitter {
  constructor(tokenSymbols, cacheDir) {
    super();
    this.tokenSymbols = tokenSymbols;

    // go one level further - separate cache by data provider

    this.cacheDir = path.join(cacheDir, 'coingecko');

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir);
    }
  }

  fetch(baseCurrency) {
    return new Promise((success, reject) => {
      // fetch global market data
      globalData(this.cacheDir)
        .then(_globalData => {
          this.emit('global_data_received');

          // fetch list of all available coins
          coinList(this.cacheDir)
            .then(list => {
              this.emit('coin_list_received', list.length);

              const promises = [];

              // fetch data for each coin
              for (const symbol of this.tokenSymbols) {
                // find a matching entry in fetched list of coins based on our symbol in portfolio
                const coin = list.find(obj => obj.symbol.toLowerCase() == symbol.toLowerCase());

                // if successful prepare request to this coin's endpoint
                if (coin) {
                  const p = new Promise(success => {
                    coinData(coin.id, this.cacheDir)
                      .then(data => {
                        try {
                          const { name } = coin;

                          this.emit('coin_data_received', coin);

                          const dataPoints = extractMarketDataPoints(data.market_data, baseCurrency);

                          if (dataPoints) {
                            //const { price } = dataPoints;
                            //const value = price * amount;

                            success({ ...{ symbol, name, currency: baseCurrency }, ...dataPoints });
                          } else {
                            success({ error: true });
                          }
                        } catch (e) {
                          console.log('Error:');
                          console.log(e);
                        }
                      })
                      .catch(error => {
                        this.emit('coin_data_received', { error });
                        success({ error });
                      });
                  });

                  promises.push(p);
                } else {
                  console.log(`Warning: unknown symbol - ${symbol}`);
                }
              }

              Promise.all(promises)
                .then(coinData => {
                  const globalData = extractGlobalData({ _globalData, coinData, baseCurrency });
                  success({ globalData, coinData });
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

export default MarketData;
