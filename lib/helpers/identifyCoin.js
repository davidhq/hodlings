// WARNING: list has to be sorted by id-s otherwise in some cases it may depend on coin order
// like:
// looking via 'ant' symbol:
// [
//   { id: 'antcoin', symbol: 'ant', name: 'ANTcoin' },
//   { id: 'aragon', symbol: 'ant', name: 'Aragon' }
//  ]
// versus reverse order ...
// so each time we are trying to identify some coin in some list, that list has to be sorted with sortCoins helper function!
function identifyCoin(geckoList, hodlingsIdentifier) {
  let hId = hodlingsIdentifier.toLowerCase();

  // UPDATE: we also push -wormhole versions of coins down the list so some of these manual corrections are not strictly needed but we still include them in case some other weird bridged versions appear
  // manual corrections..
  // without this we get for 'luna':
  // { id: 'luna-wormhole', symbol: 'luna', name: 'LUNA (Wormhole)' }
  // instead of:
  // { id: 'terra-luna', symbol: 'luna', name: 'Terra' }
  // there is no way to automatically distinguish... and Wormhole version appears first in api
  // if (hId == 'luna') {
  //   hId = 'terra-luna';
  // }
  // just in case... for now we get correct version
  if (hId == 'eth') {
    hId = 'ethereum';
  }

  // todo: perhaps sort so that wormhole versions appear last!

  // matching priority 1 - symbol and id match
  let coin = geckoList.find(({ id, symbol }) => symbol.toLowerCase() == hId && id.toLowerCase() == hId);

  // matching priority 2 - id and name match
  // this was added recently.. because of 'bitcoin' -- not sure if it screws something else up??
  // this would get matched down below
  //
  // {
  //   id: 'harrypotterobamasonic10inu',
  //   symbol: 'bitcoin',
  //   name: 'HarryPotterObamaSonic10Inu'
  // }
  //
  // instead of this here:
  // { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }
  // maybe make bitcoin a special case ??
  if (!coin) {
    coin = geckoList.find(({ id, name }) => name.toLowerCase() == hId && id.toLowerCase() == hId);
  }

  // priority 3: identifier matches
  // most coins will fall here
  if (!coin) {
    coin = geckoList.find(({ symbol }) => symbol.toLowerCase() == hId);
  }

  // priority 4: id matches
  // exotic coins: ability to match 'master-usd' for example
  if (!coin) {
    coin = geckoList.find(({ id }) => id.toLowerCase() == hId);
  }

  // priority 5: name matches
  // exotic coins: ability to match 'master-usd' for example
  if (!coin) {
    coin = geckoList.find(({ name }) => name.toLowerCase() == hId);
  }

  return coin;
}

export default identifyCoin;
