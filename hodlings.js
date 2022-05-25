#!/usr/bin/env node
import colors from 'chalk';
import path from 'path';
import { homedir } from 'os';
import program from 'commander';
import readPortfolio from './lib/readPortfolio.js';
import getHodlings from './lib/getHodlings.js';
import { formatValue } from './lib/helpers/helpers.js';
import Table from './lib/table/table.js';

import Gecko from './lib/marketData/coingecko/gecko.js';

const gecko = new Gecko();

function absolutizePath(path) {
  return path.replace(/^~/, homedir());
}

function convertHelp() {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('hodl --convert')} ${colors.green('1000 usdc eth')}`);
  console.log(`${colors.green('hodl --convert')} ${colors.green('2000 sol luna')}`);
  console.log(`${colors.green('hodl --convert')} ${colors.green('1000 deus eur')}`);
  console.log(`${colors.gray('...')}`);
}

// --convert

if (process.argv.length > 2 && (process.argv[2] == '-c' || process.argv[2] == '--convert')) {
  const args = process.argv.slice(3);

  if (args.length != 3) {
    console.log(colors.red('⚠️  Too few arguments'));
    console.log();
    convertHelp();
  } else {
    const amount = args[0];
    const coin1Name = args[1];
    const coin2Name = args[2];

    if (Number.isNaN(parseFloat(amount))) {
      console.log(colors.red(`⚠️  Not a number: ${colors.yellow(amount)}`));
      console.log();
      convertHelp();
    } else {
      gecko
        .convert({ amount, coin1Name, coin2Name })
        // coin1 and coin2 are in the form: { symbol: '', name: ''}
        // they don't include coingeckoId, we don't care about this here anymore
        .then(({ coin1, coin1Fiat, coin1Commodity, coin2, coin2Fiat, coin2Commodity, result }) => {
          const clr1 = coin1Fiat ? colors.white : coin1Commodity ? colors.yellow : colors.cyan;
          const clr2 = coin2Fiat ? colors.white : coin2Commodity ? colors.yellow : colors.cyan;

          console.log(
            `${colors.yellow(amount)} ${clr1(coin1.symbol)} ${colors.gray(`(${coin1.name})`)} = ${colors.green(formatValue(result))} ${clr2(
              coin2.symbol
            )} ${colors.gray(`(${coin2.name})`)}`
          );
        })
        .catch(e => {
          //console.log();
          //console.log(colors.red('CoinGecko API is currently not working :('));
          //console.log();
          console.log(colors.red(e));
        });
    }
  }
} else {
  // show portfolio
  program.version('0.8.5');
  program
    .option('-x, --currency <currency>', 'fiat currency to display portfolio value in (usd, eur, cny...)', 'usd')
    .option('-c, --convert <amount> <token1> <token2>', 'convert between tokens')
    .option('--file <portfolio>', 'specify a custom hodlings file', '~/.hodlings')
    .option('--eth', 'focus on eth, hide the bitcoin-specific columns (value-btc, 7-day-change-vs-btc)')
    .option('--btc', 'focus on btc, hide the ethereum-specific columns (value-eth, 7-day-change-vs-eth)')
    .parse(process.argv);

  const baseCurrency = program.currency.toLowerCase();
  const hodlingsPath = absolutizePath(program.file);

  //const focus = program.eth ? 'eth' : program.btc ? 'btc' : undefined;
  const portfolio = readPortfolio(hodlingsPath);

  const isDefaultHodlingsPath = path.join(homedir(), '.hodlings') == hodlingsPath;
  const portfolioPath = isDefaultHodlingsPath ? colors.green(hodlingsPath) : colors.magenta(hodlingsPath);
  console.log(`${colors.green('✓')} Read portfolio from ${portfolioPath} → ${colors.cyan(portfolio.length)} coins`);

  getHodlings({ portfolio, baseCurrency, showProgress: true })
    .then(({ hodlings, problems }) => {
      const table = new Table();
      console.log();
      table.render(baseCurrency, hodlings);

      console.log();
      problems.forEach(problem => console.log(problem));
    })
    .catch(e => {
      console.log(e);
      console.log();
      console.log(colors.red('CoinGecko API is currently not working :('));
      console.log();
      console.log(colors.gray(e));
    });
}
