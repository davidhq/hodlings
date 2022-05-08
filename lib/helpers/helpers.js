import approx from 'approximate-number';

import calculateChangesSinceLastRun from './calculateChangesSinceLastRun.js';
import calculateValue from './calculateValue.js';
import getTotals from './getTotals.js';
import identifyCoin from './identifyCoin.js';
import sortCoins from './sortCoins.js';
import compare from './collectionCompare.js';
import clone from './collectionClone.js';
import * as dateFns from './dateFns/index.js';

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  const res = Math.round(value * factor) / factor;
  return res == -0 ? Math.abs(res) : res;
}

// used in results of token converter
function formatValue(val) {
  if (val > 100000) {
    return approx(val);
  }

  let dec = 2;

  if (val < 0.0001) {
    dec = 12;
  } else if (val < 0.001) {
    dec = 10;
  } else if (val < 0.01) {
    dec = 8;
  } else if (val < 0.1) {
    dec = 6;
  } else if (val < 1) {
    dec = 4;
  }

  return round(val, dec).toFixed(dec);
  //.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

export { calculateValue, getTotals, calculateChangesSinceLastRun, sortCoins, identifyCoin, round, formatValue, compare, clone, dateFns };
