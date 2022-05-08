import identifyCoin from './identifyCoin.js';

// attach prices and total value to market data according to our portfolio

export default function calculateValue(portfolio, { globalData, coinsMarketData }) {
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
