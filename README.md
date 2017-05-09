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

![Sample Output](https://github.com/Talljoe/crytrac/blob/master/output.png)

```
             Value     1H%     24H%
Ethereum  $2694.54   4.18%   -6.77%
Bitcoin    $258.75  -1.08%    9.04%
Dogecoin     $1.61   6.14%  -13.82%
Total:    $2954.90
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
