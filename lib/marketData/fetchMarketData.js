import colors from 'kleur';

import Gecko from './coingecko/gecko.js';

import { sortCoins, identifyCoin } from '../helpers/helpers.js';

function extractGlobalData({ _globalData, coinsMarketData, ethBtcMarketData, baseCurrency }) {
  const data = { totalMarketCap: _globalData.total_market_cap[baseCurrency] };

  if (coinsMarketData.find(d => !d.symbol)) {
    console.log(colors.red('Missing data in coingecko api'));
    console.log('These are the entries without symbol defined:');
    console.log(coinsMarketData.filter(d => !d.symbol));
    console.log(colors.gray('Please report this issue to the author of hodlings library.'));
    console.log('coinMarketData:');
    console.log(coinsMarketData);
  }

  //console.log(coinsMarketData);

  // occasionally throws an exception: cannot read property toLowerCase() of undefined
  const btc = ethBtcMarketData.find(({ symbol }) => symbol.toLowerCase() == 'btc');
  const eth = ethBtcMarketData.find(({ symbol }) => symbol.toLowerCase() == 'eth');

  return { ...data, ...{ eth, btc } };
}

function extractMarketDataPoints(marketData, baseCurrency) {
  if (marketData) {
    const price = marketData.current_price[baseCurrency];
    const priceBTC = marketData.current_price.btc;
    const priceChange1h = marketData.price_change_percentage_1h_in_currency[baseCurrency];
    const priceChange24h = marketData.price_change_percentage_24h_in_currency[baseCurrency];
    const priceChange7d = marketData.price_change_percentage_7d_in_currency[baseCurrency];
    const marketCap = marketData.market_cap[baseCurrency];
    const totalVolume = marketData.total_volume[baseCurrency];
    const rank = marketData.market_cap_rank;

    return { price, priceBTC, priceChange1h, priceChange24h, priceChange7d, marketCap, totalVolume, rank };
  }
}

function mapHodlingsPortfolioToCoingecko({ hodlingsPortfolioIdentifiers, coingeckoCoinList }) {
  const coinIDs = [];
  const problems = [];

  for (const identifier of hodlingsPortfolioIdentifiers) {
    // identifier from ~/.hodlings portfolio
    // find a matching entry in fetched list of coins based on our id and symbol in portfolio

    const coin = identifyCoin(coingeckoCoinList, identifier);

    if (coin) {
      // we could have:
      // beethoven-x: 1
      // beets: 1
      // listed in our portfolio... we have to make sure we don't add two entries into this list
      if (!coinIDs.find(({ coingeckoId }) => coingeckoId == coin.id)) {
        coinIDs.push({ coingeckoId: coin.id, hodlingsIdentifier: identifier });
      }
    } else {
      problems.push(colors.red(`⚠️  Portfolio entry ${colors.yellow(identifier)} couldn't be identified in CoinGecko API data and was excluded`));
    }
  }

  return { coinIDs, problems };
}

function constructFetchingPromises({ coinIDs, baseCurrency, gecko, progress }) {
  return coinIDs.map(
    ({ coingeckoId, hodlingsIdentifier }) =>
      new Promise((success, reject) => {
        gecko
          .coinData(coingeckoId)
          .then(coinData => {
            try {
              const { name, symbol, id } = coinData;

              progress?.tick();

              const dataPoints = extractMarketDataPoints(coinData.market_data, baseCurrency);

              success({ ...{ symbol: symbol.toUpperCase(), name, id, currency: baseCurrency, hodlingsIdentifier }, ...dataPoints });
            } catch (e) {
              console.log('Error:');
              console.log(e);
              reject(e);
            }
          })
          .catch(reject);
      })
  );
}

function fetchMarketData({ baseCurrency, hodlingsPortfolioIdentifiers, progress }) {
  const gecko = new Gecko();

  return new Promise((success, reject) => {
    // fetch global market data
    gecko
      .globalData()
      .then(_globalData => {
        progress?.tick();

        // fetch list of all available coins
        gecko
          .coinList()
          .then(coingeckoCoinList => {
            progress?.tick();

            const { coinIDs, problems } = mapHodlingsPortfolioToCoingecko({ hodlingsPortfolioIdentifiers, coingeckoCoinList });

            // unknown coins in our portfolio - move progress bar for those now since fetching won't move it
            for (let i = 0; i < problems.length; i++) {
              progress?.tick();
            }

            //

            // fetch data for each coin
            const promises = constructFetchingPromises({ coinIDs, baseCurrency, gecko, progress });

            Promise.all(promises)
              .then(coinsMarketData => {
                const validCoins = sortCoins(coinsMarketData)
                  .filter(({ price, hodlingsIdentifier, name, id }) => {
                    if (!price) {
                      problems.push(
                        colors.red(
                          `⚠️  Excluded portfolio entry ${colors.yellow(hodlingsIdentifier)} because CoinGecko api entry for it (${colors.yellow(
                            id
                          )} / ${colors.yellow(name)}) had missing price - ${colors.white(
                            'if this is the wrong coin try using its name instead of the symbol'
                          )}`
                        )
                      );
                    }

                    return !!price;
                  })
                  .filter(({ hodlingsIdentifier }) => {
                    // this can happen (rarely) -- probably a coingecko manual error / typo..
                    // happened only once when ust felt apart and a few new versions were made
                    //
                    // in coinlist:
                    // { id: 'wrapped-ust', symbol: 'ust', name: 'Wrapped UST' }

                    // in coindata for wrapped-ust (coingecko id) request:
                    // symbol: 'USTC',
                    // name: 'Wrapped USTC',
                    // id: 'wrapped-ust',

                    // different things!!
                    // and we rely for this to be consistent...
                    // in we have hodlings portfolio identifier 'ust'
                    // then we won't ba able to find the correct coin once we construct our
                    // coinMarketData list which is made of individual requests and will have this:
                    // symbol: 'USTC',
                    // name: 'Wrapped USTC',
                    // id: 'wrapped-ust',
                    // where 'ust' is no longer present and we cannot match it...
                    // identifyCoin is not fuzzy, has to find at least one exact match in symbol, name or coingeckoid

                    const coin = identifyCoin(coinsMarketData, hodlingsIdentifier);

                    if (!coin) {
                      problems.push(
                        colors.red(
                          `⚠️  Excluded portfolio entry ${colors.yellow(
                            hodlingsIdentifier
                          )} because CoinGecko api currently returns mismatched identifiers for it`
                        )
                      );
                    }

                    return !!coin;
                  });

                // in case portfolio did not have ethereum and bitcoin
                // we still need this data and we'll find it in cache (if portfolio had these coins)
                // if not, then we make one or two additional api calls for this
                Promise.all(constructFetchingPromises({ coinIDs: [{ coingeckoId: 'ethereum' }, { coingeckoId: 'bitcoin' }], baseCurrency, gecko, progress }))
                  .then(ethBtcMarketData => {
                    const globalData = extractGlobalData({ _globalData, coinsMarketData, ethBtcMarketData, baseCurrency });
                    success({ globalData, coinsMarketData: validCoins, ethBtcMarketData, problems }); // identifyCoin expects same sorting of the list in all cases
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

export default fetchMarketData;
