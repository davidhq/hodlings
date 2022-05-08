import chalk from 'chalk';

// import fs from 'fs';
// import path from 'path';

// import { dataDir, cacheDir } from './lib/dataDirs.js';

import { identifyCoin } from './lib/helpers/helpers.js';
import Gecko from './lib/marketData/coingecko/index.js';

// *** required for everything in ./cli directory:
// function help() {
//   console.log(chalk.yellow('Usage:'));
//   console.log(`${chalk.green('conv')} ${chalk.green('1000 usdc eth')}`);
//   console.log(`${chalk.green('conv')} ${chalk.green('2000 sol eth')}`);
//   console.log(`${chalk.green('conv')} ${chalk.green('1000 deus eur')}`);
//   console.log(`${chalk.gray('...')}`);
//   // console.log(`${chalk.green('')} ${chalk.gray('')}`);
//   // console.log(`${chalk.green('')} ${chalk.gray('')}`);
// }

// if (process.argv.length <= 2 || process.argv[2] == '-h') {
//   help();
//   process.exit();
// }

// const args = process.argv.slice(2);

// if (cacheDir && !fs.existsSync(cacheDir)) {
//   fs.mkdirSync(cacheDir);
// }

// const val = args[0];
// const coin1Name = args[1];
// const coin2Name = args[2];

const fiat = ['usd', 'eur', 'gbp', 'cny', 'aud', 'jpy', 'chf', 'cad'];

const gecko = new Gecko();

export default function convert({ amount, coin1Name, coin2Name }) {
  return new Promise((success, reject) => {
    gecko
      .identifyCoin(coin1Name)
      .then(coin1 => {
        if (!coin1) {
          reject(new Error(`Unknown coin: ${coin1Name}`));
          return;
        }

        //console.log(coin1);

        gecko
          .identifyCoin(coin2Name)
          .then(coin2 => {
            if (!coin2) {
              reject(new Error(`Unknown coin: ${coin2Name}`));
              return;
            }

            //console.log(coin2);

            gecko
              .coinPrice(coin1Name)
              .then(price1 => {
                gecko
                  .coinPrice(coin2Name)
                  .then(price2 => {
                    const result = (amount * price1) / price2;
                    success({ coin1, coin2, result });
                    //console.log(`${chalk.cyan(amount)} ${chalk.yellow(coin1.id)} = ${chalk.green(formatValue(result))} ${chalk.yellow(coin2.id)}`);
                    // console.log(result);
                  })
                  .catch(reject);
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

// gecko;
//   .marketCap(coin1)
//   .then(data => {
//     console.log(approx(data));
//   })
//   .catch(() => {
//     console.log('Unable to fetch');
//   });
// gecko
//   .coinPrice(coin1)
//   .then(data => {
//     console.log(data);
//   })
//   .catch(() => {
//     console.log('Unable to fetch');
//   });
