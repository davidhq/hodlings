#!/usr/bin/env node
import ProgressBar from 'progress';
import chalk from 'chalk';

import readPortfolio from './lib/readPortfolio.js';
import MarketData from './lib/marketData.js';
import getTotals from './lib/getTotals.js';
import Table from './lib/table.js';
import PersistedState from './lib/persistedState.js';
import { dataDir, cacheDir } from './lib/dataDirs.js';

const baseCurrency = 'usd'; // has to be lowercase ...

const { hodlingsPath, portfolio } = readPortfolio();
console.log(`Read portfolio from ${chalk.green(hodlingsPath)} → ${chalk.cyan(portfolio.length)} coins`);

const marketData = new MarketData(
  portfolio.map(coin => coin.symbol),
  cacheDir
);

const bar = new ProgressBar(`Reading ${chalk.green('CoinGecko')} market data ${chalk.cyan('[:bar]')} ${chalk.cyan(':percent')} ${chalk.gray('ETA :etas')}`, {
  complete: '■',
  incomplete: ' ',
  width: 20,
  total: portfolio.length + 2 // globalData and coinList are separate requests
});

marketData.on('global_data_received', () => {
  bar.tick();
});

marketData.on('coin_list_received', () => {
  bar.tick();
});

marketData.on('coin_data_received', () => {
  bar.tick();
});

// attach prices and total value to market data according to our portfolio
function calculateValue(portfolio, { globalData, coinData }) {
  for (const coin of coinData) {
    const portfolioEntry = portfolio.find(({ symbol }) => symbol.toLowerCase() == coin.symbol.toLowerCase());
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

function calculateChangesSinceLastRun(persistedData, { globalData, coinData, totalsData }) {
  const { btc } = globalData;

  for (const coin of coinData) {
    const persistedCoin = persistedData.coins.find(({ symbol }) => symbol == coin.symbol.toLowerCase());
    if (persistedCoin) {
      coin.changeSinceLastRun = 100 * ((btc.price * coin.priceBTC) / (persistedCoin.priceBTC * persistedData.priceBTC) - 1);
    }
  }

  totalsData.valueChange = 100 * (totalsData.totalValue / persistedData.totals.totalValue - 1);
  totalsData.valueDiff = totalsData.totalValue - persistedData.totals.totalValue;

  totalsData.valueChangeETH = 100 * (totalsData.totalValueETH / persistedData.totals.totalValueETH - 1);
  totalsData.valueChangeBTC = 100 * (totalsData.totalValueBTC / persistedData.totals.totalValueBTC - 1);
}

const table = new Table();
marketData
  .fetch(baseCurrency)
  .then(({ globalData, coinData }) => {
    calculateValue(portfolio, { globalData, coinData });

    const totalsData = getTotals({ globalData, coinData });

    for (const coin of coinData) {
      coin.percentage = (100 * coin.value) / totalsData.totalValue; // we can now update percentage as well
    }

    const data = { globalData, coinData, totalsData, portfolio };
    const persistedState = new PersistedState(dataDir, baseCurrency, data);

    const persistedData = persistedState.load();

    if (persistedData) {
      calculateChangesSinceLastRun(persistedData, data);
    }

    table.render(baseCurrency, data);

    persistedState.save(baseCurrency, data);
  })
  .catch(console.log);
