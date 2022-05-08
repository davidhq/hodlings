import path from 'path';

import fetchMarketData from './marketData/fetchMarketData.js';
import Progress from './marketData/progress.js';

import PersistedState from './persistedState.js';
import { dataDir } from './dataDirs.js';

import { calculateValue, getTotals, calculateChangesSinceLastRun } from './helpers/helpers.js';

export default function getHodlings({ portfolio, baseCurrency, snapshotFilePath = path.join(dataDir, 'valueSnapshot.json'), showProgress = false }) {
  // 1. Read portfolio

  // Reads straight from our ~/.hodlings file, we get this type of information from readPortfolio() function:
  //
  // [
  //   { symbol: 'ETH', amount: '5' },
  //   { symbol: 'DAI', amount: '5' },
  //   { symbol: 'BTC', amount: '5' }
  // ]

  const hodlingsPortfolioIdentifiers = portfolio.map(coin => coin.identifier);

  //progressBar

  const progress = showProgress ? new Progress({ coinsNumber: portfolio.length }) : null;

  // 2. Get current market situation from coingecko

  return new Promise((success, reject) => {
    fetchMarketData({ baseCurrency, hodlingsPortfolioIdentifiers, progress })
      .then(({ globalData, coinsMarketData, problems }) => {
        calculateValue(portfolio, { globalData, coinsMarketData });

        const totalsData = getTotals({ globalData, coinsMarketData });

        for (const coin of coinsMarketData) {
          coin.percentage = (100 * coin.value) / totalsData.totalValue; // we can now update percentage as well
        }

        const hodlings = { portfolio, coinsMarketData, totalsData, globalData };

        const persistedState = new PersistedState(snapshotFilePath, baseCurrency, hodlings);
        const snapshot = persistedState.load();
        if (snapshot) {
          calculateChangesSinceLastRun(snapshot, { coinsMarketData, totalsData, globalData });
        }

        if (persistedState.save() && snapshot?.createdAt) {
          hodlings.changesTimestamp = snapshot.createdAt; // time of previous snapshot
        }

        success({ hodlings, problems });
      })
      .catch(reject);
  });
}
