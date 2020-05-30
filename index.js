#!/usr/bin/env node

import path from 'path';
import { homedir } from 'os';
import program from 'commander';
import renderHodlings from './lib/renderHodlings.js';

program.version('0.8.0');
program
  .option('-x, --convert <currency>', 'currency to display (usd, eur, cny...)', 'usd')
  .option('--eth', 'focus on eth, hide the bitcoin-specific columns (value-btc, 7-day-change-vs-btc)')
  .option('--btc', 'focus on btc, hide the ethereum-specific columns (value-eth, 7-day-change-vs-eth)')
  .parse(process.argv);

const baseCurrency = program.convert.toLowerCase();
const hodlingsPath = path.join(homedir(), '.hodlings');
const focus = program.eth ? 'eth' : program.btc ? 'btc' : undefined;

renderHodlings({ hodlingsPath, baseCurrency, focus });
