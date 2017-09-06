# hodlings

Display value of crypto-currency hodlings. Prices fetched from [coinmarketcap API](https://api.coinmarketcap.com/v1/ticker/).

Sample output:

![Sample Output](https://github.com/davidhq/hodlings/blob/master/output.png?raw=true)

## Prerequisites

**Summary:** `node.js` and `git`. You can skip to the next section if you already have these.

- [node.js](https://nodejs.org/en/download/) spectacular platform. LTS (Long-term support) is the right choice for most.

- [git](https://git-scm.com/downloads) incredible version control (needed in the background to install some dependencies on first install).

**Optional:** if you want easy switching between different `node.js` versions in the future and you are using **unix based systems** (macOS, Linux), you can install `node.js` via fantastic [n](https://github.com/tj/n) (don't download it from *nodejs.org* in this case).

You can also install both `node.js` and `git` via [Homebrew](https://brew.sh) friendly package manager for macOS. [n](https://github.com/tj/n) is still recommended for `node.js` though.

[npm](https://www.npmjs.com) (Node Package Manager) is installed automatically with `node.js` install (just FYI).

## Install hodlings project

In **Terminal** (Linux, macOS) or **Command Prompt** (Windows) type:

``npm install -g hodlings``

## Run

``hodl``

## Options

Try `hodl -h` for complete list and here are a few examples:

``hodl -x eur``

``hodl -x cny``

Add `--eth` to focus on **Ethereum** or `--btc` to focus on **Bitcoin** and save space for two unneeded columns.

## Configure

Create or edit the file `~/.hodlings` (Linux/MacOS: */home/[user]*, Windows: *c:\\Users\\[user]*) containing your portfolio. Use `#` to put in comments.

### Example

Specifying the entire portfolio is simple:

```
# Hodlings
BTC: 0.3123
ETH: 14.99858897
GNT: 148
REP: 623
```

Just use token ticker symbols or (even better) the token ids because multiple tokens can have the same ticker :/

Same file but using token ids:

```
# Hodlings
bitcoin: 0.3123
ethereum: 14.99858897
golem-network-tokens: 148
augur: 623
```

Read token ids from [CoinMarketCap API](https://api.coinmarketcap.com/v1/ticker).

**Tip:** it is much easier to read the json output in Chrome if you install the [JSONView Chrome extension](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc?hl=en) first. There are equivalent extensions for other browsers.

## Notes

If you run `hodl` without this file present, it will create an example file for your convenience.

To use a different hodlings file for portfolio check the `-f` option (basically just use `hodl -f ~/path_to/hodlings2`).

## Complete options
```
  Usage: hodl [options]


  Options:

    -w, --watch               refresh data periodically every 10 min
    -f, --file <f>            file to use for hodlings [~/.hodlings]
    -x, --convert <currency>  currency to display (usd, eur, cny...)
    --columns <columns>       columns to display
    --eth                     focus on eth, hide the bitcoin-specific columns (value-btc, 7-day-change-vs-btc)
    --btc                     focus on btc, hide the ethereum-specific columns (value-eth, 7-day-change-vs-eth)
    --locale <locale>         locale to use for formatting [en]
    --supported-currencies    shows list of supported currencies
    --supported-locales       shows list of supported locales
    --available-columns       shows list of columns
    --no-color                don't display colors
    -h, --help                output usage information
```

## Updates and attribution

**hodlings** is based on [crytrac](https://github.com/Talljoe/crytrac).

Improvements over original project (I wrote this list in the beginning, there were more improvements later):

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
