import chalk from 'chalk';

import readPortfolio from './readPortfolio.js';

import fetchMarketData from './marketData/fetchMarketData.js';
import Progress from './marketData/progress.js';

import Table from './table/table.js';

import PersistedState from './persistedState.js';
import { dataDir, cacheDir } from './dataDirs.js';

import { calculateValue, getTotals, calculateChangesSinceLastRun } from './helpers.js';

function renderHodlings({ hodlingsPath, baseCurrency, focus }) {
  // 1. Read portfolio

  // Reads straight from our ~/.hodlings file, we get this type of information from readPortfolio() function:
  //
  // [
  //   { symbol: 'ETH', amount: '5' },
  //   { symbol: 'DAI', amount: '5' },
  //   { symbol: 'BTC', amount: '5' }
  // ]
  const portfolio = readPortfolio(hodlingsPath);
  console.log(`Read portfolio from ${chalk.green(hodlingsPath)} → ${chalk.cyan(portfolio.length)} coins`);

  const hodlingsPortfolioIdentifiers = portfolio.map(coin => coin.identifier);

  //progressBar

  const table = new Table();

  const progress = new Progress({ coinsNumber: portfolio.length });

  // 2. Get current market situation from coingecko

  fetchMarketData({ baseCurrency, hodlingsPortfolioIdentifiers, cacheDir, progress })
    .then(({ globalData, coinsMarketData }) => {
      calculateValue(portfolio, { globalData, coinsMarketData });

      const totalsData = getTotals({ globalData, coinsMarketData });

      for (const coin of coinsMarketData) {
        coin.percentage = (100 * coin.value) / totalsData.totalValue; // we can now update percentage as well
      }

      const data = { portfolio, coinsMarketData, totalsData, globalData };

      const persistedState = new PersistedState(dataDir, baseCurrency, data);
      const persistedData = persistedState.load();
      if (persistedData) {
        calculateChangesSinceLastRun(persistedData, { coinsMarketData, totalsData, globalData });
      }

      table.render(baseCurrency, data);

      persistedState.save(baseCurrency, data);
    })
    .catch(console.log);
}

export default renderHodlings;
