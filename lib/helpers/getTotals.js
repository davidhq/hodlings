export default function getTotals({ globalData, coinsMarketData }) {
  const { eth, btc } = globalData;

  const totalValue = coinsMarketData.reduce((total, { value }) => {
    return total + value;
  }, 0);

  const totalValueETH = totalValue / eth.price;
  const totalValueBTC = totalValue / btc.price;

  return { totalValue, totalValueETH, totalValueBTC };
}
