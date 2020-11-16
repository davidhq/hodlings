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

  return coin;
}

export default identifyCoin;
