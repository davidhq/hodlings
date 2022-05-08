#!/usr/bin/env node
import chalk from 'chalk';
import path from 'path';
import { homedir } from 'os';
import program from 'commander';
import readPortfolio from './lib/readPortfolio.js';
import getHodlings from './lib/getHodlings.js';
import { formatValue } from './lib/helpers/helpers.js';
import convert from './convert.js';
import Table from './lib/table/table.js';

function absolutizePath(path) {
  return path.replace(/^~/, homedir());
}

function convertHelp() {
  console.log(chalk.yellow('Usage:'));
  console.log(`${chalk.green('hodl --convert')} ${chalk.green('1000 usdc eth')}`);
  console.log(`${chalk.green('hodl --convert')} ${chalk.green('2000 sol luna')}`);
  console.log(`${chalk.green('hodl --convert')} ${chalk.green('1000 deus eur')}`);
  console.log(`${chalk.gray('...')}`);
}

// --convert

if (process.argv.length > 2 && (process.argv[2] == '-c' || process.argv[2] == '--convert')) {
  const args = process.argv.slice(3);

  if (args.length != 3) {
    console.log(chalk.red('⚠️  Too few arguments'));
    console.log();
    convertHelp();
  } else {
    const amount = args[0];
    const coin1Name = args[1];
    const coin2Name = args[2];

    if (Number.isNaN(parseFloat(amount))) {
      console.log(chalk.red(`⚠️  Not a number: ${chalk.yellow(amount)}`));
      console.log();
      convertHelp();
    } else {
      convert({ amount, coin1Name, coin2Name })
        .then(({ coin1, coin2, result }) => {
          console.log(
            `${chalk.yellow(amount)} ${chalk.cyan(coin1.symbol)} ${chalk.gray(`(${coin1.name})`)} = ${chalk.green(formatValue(result))} ${chalk.cyan(
              coin2.symbol
            )} ${chalk.gray(`(${coin2.name})`)}`
          );
        })
        .catch(e => {
          console.log(chalk.red(e));
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
  const portfolioPath = isDefaultHodlingsPath ? chalk.green(hodlingsPath) : chalk.magenta(hodlingsPath);
  console.log(`${chalk.green('✓')} Read portfolio from ${portfolioPath} → ${chalk.cyan(portfolio.length)} coins`);

  getHodlings({ portfolio, baseCurrency, showProgress: true })
    .then(({ hodlings, problems }) => {
      const table = new Table();
      console.log();
      table.render(baseCurrency, hodlings);

      console.log();
      problems.forEach(problem => console.log(problem));
    })
    .catch(console.log);
}
