import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

import colors from 'kleur';

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
    console.log(colors.red(`\n⚠️  File ${colors.magenta(hodlingsPath)} was not found,\ncreated it with sample portfolio...`));
    console.log(colors.yellow('Please edit it with actual data.\n'));
  }
}

// {
//   hodlingsPath: '/Users/[name]/.hodlings',
//   portfolio: [
//     { identifier: 'ETH', amount: 5 },
//     { identifier: 'DAI', amount: 5 },
//     { identifier: 'BTC', amount: 5 }
//   ]
// }
function readPortfolio(hodlingsPath) {
  createIfNotPresent(hodlingsPath);

  const lines = readFileLines(hodlingsPath)
    .map(line => line.split('#')[0].trim()) // remove anything after first "#" (= comments)
    .filter(line => line != '');

  // read portfolio from text file and allow multiple listings of the same identifier, add amounts in this case
  // example:
  // ETH: 2 # account 1
  // ETH: 3 # account 2
  return lines.reduce((portfolio, line) => {
    let [identifier, amount] = line.toLowerCase().replace(/\s+/, '').split(':');

    amount = parseFloat(amount);

    const match = portfolio.find(entry => entry.identifier == identifier);

    if (match) {
      match.amount += amount;
    } else {
      portfolio.push({ identifier, amount });
    }

    return portfolio;
  }, []);
}

export default readPortfolio;
