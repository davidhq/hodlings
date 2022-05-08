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

  coinData(coingeckoId) {
    return coinData({ coingeckoId, cacheDir: this.geckoCacheDir });
  }

  coinDataByName(coinName) {
    return new Promise((success, reject) => {
      this.identifyCoin(coinName)
        .then(coinInfo => {
          if (coinInfo) {
            this.coinData(coinInfo.id).then(success).catch(reject);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  coinPrice(coinName) {
    return new Promise((success, reject) => {
      this.coinDataByName(coinName)
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
