import path from 'path';
import fs from 'fs';

import globalData from './globalData.js';
import coinList from './coinList.js';
import coinData from './coinData.js';

import { identifyCoin } from '../../helpers/helpers.js';

import { cacheDir } from '../../dataDirs.js';

class Gecko {
  constructor() {
    this.geckoCacheDir = path.join(cacheDir, 'coingecko');

    if (!fs.existsSync(this.geckoCacheDir)) {
      fs.mkdirSync(this.geckoCacheDir);
    }
  }

  globalData() {
    return globalData({ cacheDir: this.geckoCacheDir });
  }

  coinList() {
    return coinList({ cacheDir: this.geckoCacheDir });
  }

  coinData(coingeckoId, { displayFetchingNotice = false } = {}) {
    return coinData({ coingeckoId, cacheDir: this.geckoCacheDir, displayFetchingNotice });
  }

  coinDataByName(coinName, { displayFetchingNotice = false } = {}) {
    return new Promise((success, reject) => {
      this.identifyCoin(coinName)
        .then(coinInfo => {
          if (coinInfo) {
            this.coinData(coinInfo.id, { displayFetchingNotice }).then(success).catch(reject);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  coinPrice(coinName, { displayFetchingNotice = false } = {}) {
    return new Promise((success, reject) => {
      this.coinDataByName(coinName, { displayFetchingNotice })
        .then(data => {
          const usdPrice = data?.market_data?.current_price?.usd;
          if (usdPrice) {
            success(usdPrice);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  convert({ amount, coin1Name, coin2Name }) {
    //const fiat = ['usd', 'eur', 'gbp', 'cny', 'aud', 'jpy', 'chf', 'cad'];
    return new Promise((success, reject) => {
      this.identifyCoin(coin1Name)
        .then(coin1 => {
          if (!coin1) {
            reject(new Error(`Unknown coin: ${coin1Name}`));
            return;
          }

          this.identifyCoin(coin2Name)
            .then(coin2 => {
              if (!coin2) {
                reject(new Error(`Unknown coin: ${coin2Name}`));
                return;
              }

              this.coinPrice(coin1Name, { displayFetchingNotice: true })
                .then(price1 => {
                  this.coinPrice(coin2Name, { displayFetchingNotice: true })
                    .then(price2 => {
                      const result = (amount * price1) / price2;
                      success({ coin1, coin2, result });
                      //console.log(`${colors.cyan(amount)} ${colors.yellow(coin1.id)} = ${colors.green(formatValue(result))} ${colors.yellow(coin2.id)}`);
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

  marketCap(coinName) {
    return new Promise((success, reject) => {
      this.coinDataByName(coinName)
        .then(data => {
          const cap = data?.market_data?.market_cap?.usd;
          if (cap) {
            success(cap);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  identifyCoin(coinName) {
    return new Promise((success, reject) => {
      this.coinList()
        .then(list => {
          success(identifyCoin(list, coinName));
        })
        .catch(reject);
    });
  }
}

export default Gecko;
