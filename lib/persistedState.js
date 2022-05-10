import fs from 'fs';
import crypto from 'crypto';

import { identifyCoin, clone, compare } from './helpers/helpers.js';

const DATA_SCHEMA_VERSION = 0.1;

function sortPortfolio(portfolio) {
  return portfolio.sort((a, b) => a.identifier.toLowerCase().localeCompare(b.identifier.toLowerCase()));
}

function prepareSnapshot(baseCurrency, { globalData, coinsMarketData, ethBtcMarketData, totalsData, portfolio }) {
  const { totalValue, totalValueBTC, totalValueETH } = totalsData;

  const coins = portfolio
    .map(item => {
      const coin = identifyCoin(coinsMarketData, item.identifier);

      if (coin) {
        return { identifier: item.identifier.toLowerCase(), priceBTC: coin.priceBTC };
      }
    })
    .filter(item => item); // exclude entries from out portfolio that couldn't be identified in api or returned undefined price... we report these problems elsewhere

  const obj = {
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    baseCurrency,
    createdAt: Date.now(),
    totals: {
      totalValue,
      totalValueBTC,
      totalValueETH
    },
    priceBTC: ethBtcMarketData.find(({ symbol }) => symbol.toLowerCase() == 'btc').price,
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
  constructor(snapshotFilePath, baseCurrency, data) {
    this.snapshotFilePath = snapshotFilePath;
    this.baseCurrency = baseCurrency;
    this.data = data;
  }

  load() {
    if (fs.existsSync(this.snapshotFilePath)) {
      const { portfolio } = this.data;

      const persistedData = JSON.parse(fs.readFileSync(this.snapshotFilePath));

      if (persistedData.dataSchemaVersion == DATA_SCHEMA_VERSION && persistedData.signature == signature(sortPortfolio(portfolio), this.baseCurrency)) {
        this.persistedData = persistedData;
        return this.persistedData;
      }
    }
  }

  writeSnapshot(snapshot) {
    fs.writeFileSync(this.snapshotFilePath, JSON.stringify(snapshot, null, 2));
  }

  save() {
    const snapshot = prepareSnapshot(this.baseCurrency, this.data);

    // if we have a saved snapshot then only save new one if something changed
    if (this.persistedData) {
      const snapshotClone = clone(snapshot);
      delete snapshotClone.createdAt;

      const persistedDataClone = clone(this.persistedData);
      delete persistedDataClone.createdAt;

      if (!compare(snapshotClone, persistedDataClone)) {
        this.writeSnapshot(snapshot);
        return true; // something changed
      }
    } else {
      this.writeSnapshot(snapshot);
    }
  }
}

export default PersistedState;
