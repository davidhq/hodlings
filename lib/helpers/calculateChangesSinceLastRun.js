import identifyCoin from './identifyCoin.js';

export default function calculateChangesSinceLastRun(persistedData, { globalData, coinsMarketData, totalsData }) {
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
