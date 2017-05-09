# crytrac
Display value of crypto-currency holdings. Prices fetched from [CryptoCurrency Market Capitalizations](https://api.coinmarketcap.com/v1/ticker/).

Example `~/.hodlings`:
```
# Main Hodlings
BTC: 0.143
ETH: 31
DOGE: 1337 # so crypto
```

Sample output:
```
             Value    1H%    24H%
Ethereum  $2679.88  4.13%  -7.08%
Bitcoin    $256.13  0.94%   7.53%
Dogecoin     $1.74   4.0%  -7.68%

Total:    $2937.75
```

Options:
```
  Usage: node index [options]

  Options:

    -h, --help        output usage information
    -w, --watch       refresh data periodically
    -s, --symbol      use symbol instead of full name
    -v, --value-only  don't display gain/loss columns
    --no-color        don't display colors
```
