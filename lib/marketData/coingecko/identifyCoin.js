// priority 1: both id and symbol match
//
// we are covering this use case for symbol = 'musd'
// {
//   "id": "musd",
//   "symbol": "musd",
//   "name": "mStable USD"
// }
// {
//   "id": "master-usd",
//   "symbol": "musd",
//   "name": "MASTER USD"
// },
//
// we have to be sure we match the mStable USD

function identifyCoin(list, symbol) {
  const _symbol = symbol.toLowerCase();

  let coin = list.find(obj => obj.symbol.toLowerCase() == _symbol && (!obj.id || (obj.id && obj.id.toLowerCase() == _symbol)));

  // priority 2: symbol matches
  // most coins will fall here
  if (!coin) {
    coin = list.find(obj => obj.symbol.toLowerCase() == _symbol);
  }

  // priority 3: id matches
  // exotic coins: ability to match 'master-usd' for example
  if (!coin) {
    coin = list.find(obj => !obj.id || (obj.id && obj.id.toLowerCase() == _symbol));
  }

  return coin;
}

export default identifyCoin;
