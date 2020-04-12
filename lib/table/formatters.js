import getUserLocaleImport from 'get-user-locale';

import Globalize from 'globalize';
import cldr from 'cldr-data';

const { getUserLocale } = getUserLocaleImport;

const currentLocale = getUserLocale()
  .split('-')[0]
  .toLowerCase();

Globalize.load(cldr.entireSupplemental());
Globalize.load(cldr.entireMainFor(currentLocale));

const globalize = Globalize(currentLocale);

const bigNumberFormatter = globalize.numberFormatter({ minimumFractionDigits: 0, maximumFractionDigits: 2 });
const numberFormatter = globalize.numberFormatter({ minimumFractionDigits: 0, maximumFractionDigits: 4 });

export default {
  number: value => {
    if (value > 10 ** 7) {
      return `${bigNumberFormatter(value / 10 ** 6)} m`;
    }

    if (value > 10 ** 4) {
      return `${bigNumberFormatter(value / 10 ** 3)} k`;
    }

    return numberFormatter(parseFloat(value)); // globalize expects float / int
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

  bigCurrency: baseCurrency => {
    return value => globalize.formatCurrency(value / 10 ** 6, baseCurrency.toUpperCase(), { useGrouping: true, maximumFractionDigits: 0 });
  }
};
