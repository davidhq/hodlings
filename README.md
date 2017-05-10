# crytrac
Display value of crypto-currency holdings. Prices fetched from [CryptoCurrency Market Capitalizations](https://api.coinmarketcap.com/v1/ticker/).

## Install

``sudo npm install -g crytrac``

## Configure

Create the file `~/.hodlings` containing your portfolio. You can
have the same currency on more than one line, all values are summed
together. Use `#` to put in comments.

### Example
```
# Main Hodlings
BTC: 0.143
ETH: 31
DOGE: 1337 # so crypto
```

## Run

``crytrac``

### Sample output:

![Sample Output](https://github.com/Talljoe/crytrac/blob/master/output.png?raw=true)

```
             Value     1H%     24H%
Ethereum  $2694.54   4.18%   -6.77%
Bitcoin    $258.75  -1.08%    9.04%
Dogecoin     $1.61   6.14%  -13.82%
Total:    $2954.90
```

## Options
```
  Usage: crytrac [options]

  Options:

    -h, --help                output usage information
    -w, --watch               refresh data periodically
    -s, --symbol              use symbol instead of full name
    -v, --value-only          only display value (deprecated)
    -c, --show-count          show amount of each coin (deprecated)
    -f, --file <f>            file to use for holdings [~/.hodlings]
    -x, --convert <currency>  currency to display
    --hide-header             don't display table header
    --columns <columns>       columns to display [name,value,1-hour-change,24-hour-change]
    --locale <locale>         locale to use for formatting [en]
    --supported-currencies    shows list of supported currencies
    --supported-locales       shows list of supported locales
    --available-columns       shows list of columns
    --no-color                don't display colors
```

## Tip

* ETH: ``0x93b71c472f1C2fb95EE3F6c1c3eA46aCC730A23e``
* DASH: ``XgeBMNGJYzKB1kTkNQEM6GDg8oxNQvwmL3``
* BTC: ``176DTiuLzVLCvTQD1HTpBRKNgM25TvLTxi``
