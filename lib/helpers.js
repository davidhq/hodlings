import chalk from 'chalk';

import { identifyCoin } from './marketData/coingecko/index.js';

// attach prices and total value to market data according to our portfolio
function calculateValue(portfolio, { globalData, coinsMarketData }) {
  // console.log(coinsMarketData);
  // process.exit();
  for (const portfolioEntry of portfolio) {
    const coin = identifyCoin(coinsMarketData, portfolioEntry.identifier);

    // if some portfolio entry couldn't be identified, we already reported this to user elsewhere...
    // here we just don't calcualte the value
    if (coin) {
      const { amount } = portfolioEntry;

      coin.amount = amount;
      coin.value = amount * coin.price;

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

export { calculateValue, getTotals, calculateChangesSinceLastRun };
