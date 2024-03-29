import colors from 'kleur';

import tableImport from 'table';

import tableColumnsDef from './tableColumns.js';
import styles from './styles.js';
import footer from './footer.js';
import { dateFns } from '../helpers/helpers.js';

const { table, getBorderCharacters } = tableImport;

function createRow(coin) {
  return [
    ['Name', coin.name],
    ['Value', coin.value],
    ['Price', coin.price],
    ['Change', coin.changeSinceLastRun],
    ['Pct', coin.percentage],
    ['1H', coin.priceChange1h],
    ['24H', coin.priceChange24h],
    ['7D', coin.priceChange7d],
    ['Count', coin.amount],
    ['Symbol', coin.symbol],
    ['Value-ETH', coin.valueETH],
    ['7DvsETH', coin._7DvsETH],
    ['Value-BTC', coin.valueBTC],
    ['7DvsBTC', coin._7DvsBTC],
    ['Cap', coin.marketCap],
    ['Vol', coin.totalVolume],
    ['Rank', coin.rank]
  ];
}

function applyColumnStyle({ value, formattedValue, definition }) {
  const { style, conditionalStyle } = definition;

  if (style) {
    return style(formattedValue);
  }

  if (conditionalStyle) {
    return conditionalStyle(value, formattedValue);
  }

  return formattedValue;
}

function applyFormatting({ value, definition }) {
  const { formatter } = definition;

  if (formatter) {
    const formattedValue = formatter(value);

    return { value, formattedValue, definition };
  }

  return { value, formattedValue: value, definition };
}

function parseColumn(tableColumns, [columnId, columnValue]) {
  return { value: columnValue, definition: tableColumns[columnId] };
}

class Table {
  config() {
    return {
      border: getBorderCharacters('void'),
      columnDefault: {
        alignment: 'right',
        paddingLeft: 0,
        paddingRight: 2
      },
      columns: {
        0: { alignment: 'left' }
      },
      drawHorizontalLine: () => {
        return false;
      }
    };
  }

  render(baseCurrency, { globalData, coinsMarketData, totalsData, changesTimestamp }) {
    const rows = coinsMarketData.sort((a, b) => b.value - a.value).map(coin => createRow(coin));

    if (rows.length > 0) {
      const header = rows[0].map(column => column[0]).map(text => styles.header(text));

      const rendered = table(
        [header].concat(
          rows.map(row =>
            row.map(column => {
              return applyColumnStyle(applyFormatting(parseColumn(tableColumnsDef(baseCurrency), column)));
            })
          )
        ),
        this.config()
      );

      console.log(rendered);

      console.log(footer(baseCurrency, globalData, totalsData));

      if (changesTimestamp) {
        console.log();
        let ch = colors.green;
        if (totalsData?.valueDiff < 0) {
          ch = colors.red;
        }
        console.log(colors.gray(`Changes compared to ${ch(`${dateFns.formatDistanceToNow(changesTimestamp)} ago`)}.`));
      }
    }
  }
}

export default Table;
