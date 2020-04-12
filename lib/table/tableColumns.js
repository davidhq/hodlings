import chalk from 'chalk';

import formatters from './formatters.js';
import styles from './styles.js';

const { upDownStyle } = styles;

function columns(baseCurrency) {
  return {
    Name: {
      style: chalk.cyan
    },
    Value: {
      style: chalk.blue.bold,
      formatter: formatters.currency(baseCurrency)
    },
    Price: {
      style: chalk.magenta,
      formatter: formatters.currency(baseCurrency)
    },
    Pct: {
      style: chalk.cyan.dim,
      formatter: formatters.percentage
    },
    Change: {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    Count: {
      style: chalk.white,
      formatter: formatters.number
    },
    '1H': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    '24H': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    '7D': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    Symbol: {
      style: chalk.white
    },
    'Value-ETH': {
      style: chalk.gray,
      formatter: formatters.number
    },
    '7DvsETH': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    'Value-BTC': {
      style: chalk.gray,
      formatter: formatters.number
    },
    '7DvsBTC': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    Rank: {
      style: chalk.white
    },
    'Vol (M)': {
      style: chalk.magenta.dim,
      formatter: formatters.bigCurrency(baseCurrency)
    },
    'Cap (M)': {
      style: chalk.cyan.dim,
      formatter: formatters.bigCurrency(baseCurrency)
    }
  };
}

export default columns;
