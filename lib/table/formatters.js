import approx from 'approximate-number';
import getUserLocaleImport from 'get-user-locale';
import colors from 'chalk';

import Globalize from 'globalize';
import cldr from 'cldr-data';

const { getUserLocale } = getUserLocaleImport;

const currentLocale = getUserLocale().split('-')[0].toLowerCase();

Globalize.load(cldr.entireSupplemental());
Globalize.load(cldr.entireMainFor(currentLocale));

const globalize = Globalize(currentLocale);

const bigNumberFormatter = globalize.numberFormatter({ minimumFractionDigits: 0, maximumFractionDigits: 2 });
const numberFormatter = globalize.numberFormatter({ minimumFractionDigits: 0, maximumFractionDigits: 4 });

//new Intl.NumberFormat('en', { style: 'currency', currency: 'JPY' }).format(number);

//const bigNumberFormatter =

export default {
  number: value => {
    if (Math.abs(value) > 10 ** 6) {
      return `${bigNumberFormatter(value / 10 ** 6)} ${colors.cyan('m')}`;
    }

    if (Math.abs(value) > 10 ** 4) {
      return `${bigNumberFormatter(value / 10 ** 3)} ${colors.cyan('k')}`;
    }

    return numberFormatter(value); // float
  },

  percentage: value => {
    if (Number.isNaN(value)) {
      value = 0;
    } else {
      value /= 100; // we get percents from coingecko already
    }

    return globalize.formatNumber(value || 0, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  currency: baseCurrency => globalize.currencyFormatter(baseCurrency.toUpperCase(), { useGrouping: true }),
  // problems with advanced features -- grouping etc.
  //currency: baseCurrency => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency.toUpperCase() }).format,

  bigCurrency: baseCurrency => {
    //return value => new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency.toUpperCase() }).format(value / 10 ** 6);
    //return value => globalize.currencyFormatter(baseCurrency.toUpperCase())(0);
    return value => approx(value);
    //return value =>
    //globalize.formatCurrency(value / 10 ** 6, baseCurrency.toUpperCase(), { useGrouping: true, maximumFractionDigits: 0 });
    //globalize.formatCurrency(value, baseCurrency.toUpperCase(), { useGrouping: true, maximumFractionDigits: 0, compact: 'short' }).toLowerCase();
  }
};
