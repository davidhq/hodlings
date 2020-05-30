import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

import chalk from 'chalk';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readFileLines(filePath) {
  return fs
    .readFileSync(filePath)
    .toString()
    .split('\r')
    .join('')
    .split('\n');
}

function createIfNotPresent(hodlingsPath) {
  if (!fs.existsSync(hodlingsPath)) {
    const sourceFile = path.join(__dirname, '../.hodlings-example');
    fs.writeFileSync(hodlingsPath, fs.readFileSync(sourceFile));
    console.log(chalk.red(`\n⚠️  File ${chalk.magenta(hodlingsPath)} was not found,\ncreated it with sample portfolio...`));
    console.log(chalk.yellow('Please edit it with actual data.\n'));
  }
}

// {
//   hodlingsPath: '/Users/[name]/.hodlings',
//   portfolio: [
//     { symbol: 'ETH', amount: '5' },
//     { symbol: 'DAI', amount: '5' },
//     { symbol: 'BTC', amount: '5' }
//   ]
// }
function readPortfolio(hodlingsPath) {
  createIfNotPresent(hodlingsPath);

  const lines = readFileLines(hodlingsPath)
    .map(line => line.trim())
    .filter(line => line != '' && !line.startsWith('#'));

  return lines.map(line => {
    const [symbol, amount] = line.replace(/\s+/, '').split(':');
    return { symbol, amount };
  });
}

export default readPortfolio;
