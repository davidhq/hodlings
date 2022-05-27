import colors from 'kleur';

import formatters from './formatters.js';
import styles from './styles.js';

const { upDownStyle, marketCapStyle, rankStyle } = styles;

function columns(baseCurrency) {
  return {
    Name: {
      style: colors.cyan
    },
    Value: {
      style: colors.blue().bold,
      formatter: formatters.currency(baseCurrency)
    },
    Price: {
      style: colors.magenta,
      formatter: formatters.currency(baseCurrency)
    },
    Pct: {
      style: colors.cyan().dim,
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
      style: colors.white,
      formatter: formatters.number
    },
    Symbol: {
      style: colors.cyan
    },
    'Value-ETH': {
      style: colors.gray,
      formatter: formatters.number
    },
    '7DvsETH': {
      conditionalStyle: upDownStyle,
      formatter: formatters.percentage
    },
    'Value-BTC': {
      style: colors.gray,
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
      style: colors.magenta().dim,
      formatter: formatters.bigCurrency(baseCurrency)
    },
    Rank: {
      conditionalStyle: rankStyle
    }
  };
}

export default columns;
