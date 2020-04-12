import styles from './styles.js';
import formatters from './formatters.js';

function renderFooter(baseCurrency, globalData, totalsData) {
  const { eth, btc, totalMarketCap } = globalData;

  const { totalValue, totalValueBTC, totalValueETH } = totalsData;

  const result = [];

  let total = styles.totalValue(formatters.currency(baseCurrency)(totalValue));

  if (totalsData.valueChange != null) {
    total += ` ${styles.upDownStyle(totalsData.valueChange, formatters.percentage(totalsData.valueChange))}`;
    total += styles.dim(` (${formatters.currency(baseCurrency)(totalsData.valueDiff)})`);
  }

  let totalETH = styles.totalValue(formatters.number(totalValueETH));

  if (totalsData.valueChangeETH != null) {
    totalETH += ` ${styles.upDownStyle(totalsData.valueChangeETH, formatters.percentage(totalsData.valueChangeETH))}`;
  }

  let totalBTC = styles.totalValue(formatters.number(totalValueBTC));

  if (totalsData.valueChangeBTC != null) {
    totalBTC += ` ${styles.upDownStyle(totalsData.valueChangeBTC, formatters.percentage(totalsData.valueChangeBTC))}`;
  }

  result.push(styles.totalLabel('Total: ') + total);
  result.push(styles.totalLabel('ETH: ') + totalETH);
  result.push(styles.totalLabel('BTC: ') + totalBTC);
  result.push(styles.totalLabel('Cap Total (M): ') + styles.footerValue(formatters.bigCurrency(baseCurrency)(totalMarketCap)));
  result.push(styles.totalLabel('ETH: ') + styles.footerValue(formatters.percentage((100 * eth.marketCap) / totalMarketCap)));
  result.push(styles.totalLabel('BTC: ') + styles.footerValue(formatters.percentage((100 * btc.marketCap) / totalMarketCap)));
  result.push(styles.totalLabel('Flippening: ') + styles.footerValue(formatters.percentage((100 * eth.marketCap) / btc.marketCap)));

  return result.join(' / ');
}

export default renderFooter;
