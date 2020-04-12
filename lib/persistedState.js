import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_SCHEMA_VERSION = 0.1;

function sortPortfolio(portfolio) {
  return portfolio.sort((a, b) => a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase()));
}

function extractData(baseCurrency, { globalData, coinData, totalsData, portfolio }) {
  const { totalValue, totalValueBTC, totalValueETH } = totalsData;

  const coins = portfolio.map(item => {
    const obj = { symbol: item.symbol.toLowerCase() };

    const coin = coinData.find(({ symbol }) => symbol.toLowerCase() == item.symbol.toLowerCase());

    if (coin) {
      obj.priceBTC = coin.priceBTC;
    }

    return obj;
  });

  const obj = {
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    baseCurrency,
    totals: {
      totalValue,
      totalValueBTC,
      totalValueETH
    },
    priceBTC: coinData.find(({ symbol }) => symbol.toLowerCase() == 'btc').price,
    marketCap: globalData.totalMarketCap,
    coins
  };

  obj.signature = signature(sortPortfolio(portfolio), baseCurrency);

  return obj;
}

function signature(portfolio, baseCurrency) {
  return crypto
    .createHash('sha256')
    .update(`${JSON.stringify(portfolio)} // baseCurrency: ${baseCurrency}`)
    .digest('hex');
}

class PersistedState {
  constructor(dataDir, baseCurrency, data) {
    this.dataFile = path.join(dataDir, 'valueSnapshot.json');
    this.baseCurrency = baseCurrency;
    this.data = data;
  }

  load() {
    if (fs.existsSync(this.dataFile)) {
      const { portfolio } = this.data;

      const persistedData = JSON.parse(fs.readFileSync(this.dataFile));

      if (persistedData.dataSchemaVersion == DATA_SCHEMA_VERSION && persistedData.signature == signature(sortPortfolio(portfolio), this.baseCurrency)) {
        return persistedData;
      }
    }
  }

  save() {
    fs.writeFileSync(this.dataFile, JSON.stringify(extractData(this.baseCurrency, this.data), null, 2));
  }
}

export default PersistedState;
