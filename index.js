#!/usr/bin/env node

import path from 'path';
import { homedir } from 'os';
import program from 'commander';
import renderHodlings from './lib/renderHodlings.js';

function absolutizePath(path) {
  return path.replace(/^~/, homedir());
}

program.version('0.8.0');
program
  .option('-x, --convert <currency>', 'currency to display (usd, eur, cny...)', 'usd')
  .option('--file <portfolio>', 'specify a custom hodlings file instead of defailt ~/.hodlings', '~/.hodlings')
  .option('--eth', 'focus on eth, hide the bitcoin-specific columns (value-btc, 7-day-change-vs-btc)')
  .option('--btc', 'focus on btc, hide the ethereum-specific columns (value-eth, 7-day-change-vs-eth)')
  .parse(process.argv);

const baseCurrency = program.convert.toLowerCase();
const hodlingsPath = absolutizePath(program.file);

const isDefaultHodlingsPath = path.join(homedir(), '.hodlings') == hodlingsPath;

const focus = program.eth ? 'eth' : program.btc ? 'btc' : undefined;

renderHodlings({ hodlingsPath, isDefaultHodlingsPath, baseCurrency, focus });
