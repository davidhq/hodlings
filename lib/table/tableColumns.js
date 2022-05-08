import chalk from 'chalk';

import formatters from './formatters.js';
import styles from './styles.js';

const { upDownStyle, marketCapStyle, rankStyle } = styles;

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
    Count: {
      style: chalk.white,
      formatter: formatters.number
    },
    Symbol: {
      style: chalk.cyan
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
    Cap: {
      conditionalStyle: marketCapStyle,
      formatter: formatters.bigCurrency(baseCurrency)
    },
    Vol: {
      style: chalk.magenta.dim,
      formatter: formatters.bigCurrency(baseCurrency)
    },
    Rank: {
      conditionalStyle: rankStyle
    }
  };
}

export default columns;
