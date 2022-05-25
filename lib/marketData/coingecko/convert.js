import getFiat from './getFiat.js';
import getCommodity from './getCommodity.js';

export default function convert({ amount, coin1Name, coin2Name, gecko }) {
  return new Promise((success, reject) => {
    if ((getFiat(coin1Name) || getCommodity(coin1Name)) && (getFiat(coin2Name) || getCommodity(coin2Name))) {
      gecko.coinData('bitcoin').then(data => {
        const prices = data?.market_data?.current_price;
        if (prices) {
          const coin1 = { symbol: coin1Name, name: getFiat(coin1Name) || getCommodity(coin1Name) };
          const coin2 = { symbol: coin2Name, name: getFiat(coin2Name) || getCommodity(coin2Name) };

          const result = (amount * prices[coin2Name.toLowerCase()]) / prices[coin1Name.toLowerCase()];

          success({
            coin1,
            coin1Fiat: getFiat(coin1Name),
            coin1Commodity: getCommodity(coin1Name),
            coin2,
            coin2Fiat: getFiat(coin2Name),
            coin2Commodity: getCommodity(coin2Name),
            result
          });
        } else {
          reject(new Error('Missing data from gecko API'));
        }
      });
    } else if (getFiat(coin1Name) || getFiat(coin2Name) || getCommodity(coin1Name) || getCommodity(coin2Name)) {
      // assumption1: just assume we're always converting from fiat/commodity to crypto
      const fiatOrCommodityName = getFiat(coin1Name) || getCommodity(coin1Name) ? coin1Name : coin2Name;
      const cryptoCoinName = getFiat(coin1Name) || getCommodity(coin1Name) ? coin2Name : coin1Name;

      gecko
        .identifyCoin(cryptoCoinName)
        .then(cryptoCoin => {
          if (!cryptoCoin) {
            reject(new Error(`Unknown coin: ${cryptoCoinName}`));
            return;
          }

          gecko
            .coinData(cryptoCoin.id, { displayFetchingNotice: true })
            .then(data => {
              const prices = data?.market_data?.current_price;
              if (prices) {
                const coin1 = { symbol: fiatOrCommodityName, name: getFiat(fiatOrCommodityName) || getCommodity(fiatOrCommodityName) };
                const coin2 = cryptoCoin;

                const price = prices[fiatOrCommodityName.toLowerCase()];

                // can only happen if we added some fiat in the ./getFiat list that coingecko does not support
                // or by error of coingecko api currently not returning this info for some reason
                if (!price) {
                  reject(
                    new Error(
                      `No price quote for ${fiatOrCommodityName} (fiat/commodity?) in coingecko market data for coin ${cryptoCoin.id} (${cryptoCoin.name})`
                    )
                  );
                  return;
                }

                // if assumption1 was true
                if (getFiat(coin1Name) || getCommodity(coin1Name)) {
                  success({ coin1, coin1Fiat: getFiat(coin1Name), coin1Commodity: getCommodity(coin1Name), coin2, result: amount / price });
                } else {
                  // if assumption1 was wrong
                  // we get correct result in all cases with non-duplicate code by doing this:
                  success({ coin1: coin2, coin2: coin1, coin2Fiat: getFiat(coin2Name), coin2Commodity: getCommodity(coin2Name), result: amount * price });
                }
              } else {
                reject(new Error('Missing data from gecko API'));
              }
            })
            .catch(reject);
        })
        .catch(reject);
    } else {
      gecko
        .identifyCoin(coin1Name)
        .then(coin1 => {
          if (!coin1) {
            reject(new Error(`Unknown coin: ${coin1Name}`));
            return;
          }

          gecko
            .identifyCoin(coin2Name)
            .then(coin2 => {
              if (!coin2) {
                reject(new Error(`Unknown coin: ${coin2Name}`));
                return;
              }

              gecko
                .coinPrice(coin1Name, { displayFetchingNotice: true })
                .then(price1 => {
                  gecko
                    .coinPrice(coin2Name, { displayFetchingNotice: true })
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
    }
  });
}
