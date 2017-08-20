# hodlings

Display value of crypto-currency hodlings. Prices fetched from [coinmarketcap API](https://api.coinmarketcap.com/v1/ticker/).

Sample output:

![Sample Output](https://github.com/davidhq/hodlings/blob/master/output.png?raw=true)

## Install

``npm install -g hodlings``

## Run

``hodl``

``hodl -x eur``

``hodl -x cny``

## Configure

Create or edit the file `~/.hodlings` (Linux/MacOS: */home/[user]*, Windows: *c:\\Users\\[user]*) containing your portfolio. Use `#` to put in comments.

### Example
```
# Hodlings
BTC: 0.3123
ETH: 14.99858897
GNT: 148
REP: 623
```

## Options
```
  Usage: hodl [options]


  Options:

    -w, --watch               refresh data periodically every 10 min
    -f, --file <f>            file to use for hodlings [~/.hodlings]
    -x, --convert <currency>  currency to display (usd, eur, cny...)
    --columns <columns>       columns to display
    --locale <locale>         locale to use for formatting [en]
    --supported-currencies    shows list of supported currencies
    --supported-locales       shows list of supported locales
    --available-columns       shows list of columns
    --no-color                don't display colors
    -h, --help                output usage information
```

## Updates and attribution

**hodlings** is based on [crytrac](https://github.com/Talljoe/crytrac).

Improvements over original project:

* show percentage change vs USD since last run in addition to 1h, 24h and 7d changes
* show 7d change vs ETH and BTC as well
* show each hodling value in terms of ETH and BTC in addition to chosen fiat currency USD, EUR... (*-x* option)
* coins in *~/.hodlings* file can be specified with ids (*basic-attention-token* instead of symbols, eg. *BAT*). Some coins were ambiguous (same symbol) which caused problems. Using ids is recommended.
* all columns are shown by default because users mostly don't know how to turn them on before reading *--help* and besides mostly all columns are useful and nicely laid out
* footer shows total value in ETH and BTC in addition to chosen fiat currency
* footer shows ETH market cap percentage of total crypto market cap
* footer shows the *flippening ratio*
* add 24h volume (as percentage of bitcoin's volume) column
* add rank column
* copy *.hodlings-example* file to *~/.hodlings* on first run for easier onboarding
* adjust a few colors in the portfolio table for a nicer look
* remove broken export to csv feature and a few deprecated or unneeded config options

I changed the project's repo/name because:

* easy install over npm using a new package name
* possible rewrite in regular JavaScript instead of LiveScript and further expansion of features so regular fork would not be suitable

Thanx again to [Joe Wasson](http://talljoe.com) for a great project which persuaded with simplicity and nice look.
