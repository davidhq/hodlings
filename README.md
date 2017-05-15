# crytrac
Display value of crypto-currency holdings. Prices fetched from [CryptoCurrency Market Capitalizations](https://api.coinmarketcap.com/v1/ticker/).

![Sample Output](https://github.com/Talljoe/crytrac/blob/master/output.png?raw=true)

## Install

``sudo npm install -g crytrac``

## Configure

Create the file `~/.hodlings` containing your portfolio. You can
have the same currency on more than one line, all values are summed
together. Use `#` to put in comments.

### Example
```
# Main Hodlings
BTC: 0.3123
ETH: 14.99858897
ETC: 46.27405992
DASH: 23.50598398
SWT: 30
GNT: 148
SNGLS: 623
```

## Run

``crytrac``

### Sample output:


```
                      Value     1H%    24H%      7D%     Pct
Dash              $2,042.01   0.95%  -2.68%  -13.60%  45.78%
Ethereum          $1,401.67   0.87%   3.97%    1.22%  31.43%
Bitcoin             $540.89   0.78%  -3.48%    4.53%  12.13%
Ethereum Classic    $298.37  -0.15%   2.94%   -5.74%   6.69%
SingularDTV          $96.68   3.13%  -1.75%   28.76%   2.17%
Swarm City           $50.27   0.90%  -7.43%  -18.53%   1.13%
Golem                $30.43  -3.08%  -3.00%  -15.14%   0.68%
Total: $4,460.32 / Cap (M): $54,751 / BTC: 51.66% / 9:46:57 AM

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
    --format <format>         sets ouput format (table,csv) [table]
    --columns <columns>       columns to display
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
