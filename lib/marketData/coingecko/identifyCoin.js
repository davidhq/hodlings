// WARNING: list has to be sorted by id-s otherwise in some cases it may depend on coin order
// like:
// looking via 'ant' symbol:
// [
//   { id: 'antcoin', symbol: 'ant', name: 'ANTcoin' },
//   { id: 'aragon', symbol: 'ant', name: 'Aragon' }
//  ]
// versus reverse order ...
// so each time we are trying to identify some coin in some list, that list has to be sorted with sortCoinlist helper function!
function identifyCoin(geckoList, hodlingsIdentifier) {
  const hId = hodlingsIdentifier.toLowerCase();

  // matching priority 1
  let coin = geckoList.find(({ id, symbol }) => symbol.toLowerCase() == hId && id.toLowerCase() == hId);

  // priority 2: identifier matches
  // most coins will fall here
  if (!coin) {
    coin = geckoList.find(({ symbol }) => symbol.toLowerCase() == hId);
  }

  // priority 3: id matches
  // exotic coins: ability to match 'master-usd' for example
  if (!coin) {
    coin = geckoList.find(({ id }) => id.toLowerCase() == hId);
  }

  // priority 4: name matches
  // exotic coins: ability to match 'master-usd' for example
  if (!coin) {
    coin = geckoList.find(({ name }) => name.toLowerCase() == hId);
  }

  return coin;
}

export default identifyCoin;
