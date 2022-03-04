import chalk from 'chalk';

import { identifyCoin } from './marketData/coingecko/index.js';

// attach prices and total value to market data according to our portfolio
function calculateValue(portfolio, { globalData, coinsMarketData }) {
  for (const portfolioEntry of portfolio) {
    const coin = identifyCoin(coinsMarketData, portfolioEntry.identifier);

    // if some portfolio entry couldn't be identified, we already reported this to user elsewhere...
    // here we just don't calcualte the value
    if (coin && coin.price) {
      const { amount } = portfolioEntry;

      coin.amount = coin.amount || 0;
      // we need this because of beethoven-x vs beets example case when the same token is mentioned through different handles which are ultimately resolved to one coin
      // but we still have two entries in our raw portfolio list
      coin.amount += amount;
      coin.value = coin.amount * coin.price;

      const { btc, eth } = globalData;

      coin.valueETH = coin.value / eth.price;
      coin.valueBTC = coin.value / btc.price;

      coin._7DvsETH = coin.priceChange7d - eth.priceChange7d;
      coin._7DvsBTC = coin.priceChange7d - btc.priceChange7d;
    }
  }
}

function getTotals({ globalData, coinsMarketData }) {
  const { eth, btc } = globalData;

  const totalValue = coinsMarketData.reduce((total, { value }) => {
    return total + value;
  }, 0);

  const totalValueETH = totalValue / eth.price;
  const totalValueBTC = totalValue / btc.price;

  return { totalValue, totalValueETH, totalValueBTC };
}

function calculateChangesSinceLastRun(persistedData, { globalData, coinsMarketData, totalsData }) {
  const { btc } = globalData;

  for (const coinInfo of persistedData.coins) {
    const coin = identifyCoin(coinsMarketData, coinInfo.identifier);
    if (coin) {
      coin.changeSinceLastRun = 100 * ((btc.price * coin.priceBTC) / (coinInfo.priceBTC * persistedData.priceBTC) - 1);
    }
  }

  // for (const coin of coinsMarketData) {
  //   console.log(coin);
  //   const persistedCoin = persistedData.coins.find(({ identifier }) => identifier == coin.symbol.toLowerCase());
  //   if (persistedCoin) {
  //     coin.changeSinceLastRun = 100 * ((btc.price * coin.priceBTC) / (persistedCoin.priceBTC * persistedData.priceBTC) - 1);
  //   }
  // }

  totalsData.valueChange = 100 * (totalsData.totalValue / persistedData.totals.totalValue - 1);
  totalsData.valueDiff = totalsData.totalValue - persistedData.totals.totalValue;

  totalsData.valueChangeETH = 100 * (totalsData.totalValueETH / persistedData.totals.totalValueETH - 1);
  totalsData.valueChangeBTC = 100 * (totalsData.totalValueBTC / persistedData.totals.totalValueBTC - 1);
}

// source: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
//
// usage:
// array is sorted by band only
// singers.sort(compareKeys('band'));
//
// in descending order
// singers.sort(compareKeys('band', null, 'desc'));
//
// array is sorted by band, then by year in ascending order by default
// singers.sort(compareKeys('band', 'year'));
//
// array is sorted by band, then by year in descending order
// singers.sort(compareKeys('band', 'year', 'desc'));
function compareKeys(key, key2, order = 'asc') {
  function _comparison(a, b, key) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  }

  return function innerSort(a, b) {
    let comparison = _comparison(a, b, key);

    if (comparison == 0 && key2) {
      comparison = _comparison(a, b, key2);
    }

    return comparison;
  };
}

function sortCoinlist(coinList) {
  return coinList.sort(compareKeys('id', 'name'));
}

export { calculateValue, getTotals, calculateChangesSinceLastRun, sortCoinlist };
