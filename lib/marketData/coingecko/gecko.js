import path from 'path';
import fs from 'fs';

import globalData from './globalData.js';
import coinList from './coinList.js';
import coinData from './coinData.js';
import convert from './convert.js';

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

  identifyCoin(coinName) {
    return new Promise((success, reject) => {
      this.coinList()
        .then(list => {
          success(identifyCoin(list, coinName));
        })
        .catch(reject);
    });
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
    return convert({ amount, coin1Name, coin2Name, gecko: this });
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
}

export default Gecko;
