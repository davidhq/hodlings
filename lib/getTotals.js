function getTotals({ globalData, coinData }) {
  const { eth, btc } = globalData;

  const totalValue = coinData.reduce((total, { value }) => {
    return total + value;
  }, 0);

  const totalValueETH = totalValue / eth.price;
  const totalValueBTC = totalValue / btc.price;

  return { totalValue, totalValueETH, totalValueBTC };
}

export default getTotals;
