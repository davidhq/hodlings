require! <[ chalk ]>
require! <[ ./locale ]>
require! 'prelude-ls' : { flip, map, sort-by, reverse, join }
require! table : { table, getBorderCharacters }

generate-table = (flip table) do
  border: getBorderCharacters \void
  drawHorizontalLine: ->
  columnDefault:
    alignment: \right
    paddingLeft: 0
    paddingRight: 2
  columns:
    0: alignment: \left

style =
  header: chalk.white.bold.underline
  date: chalk.white.dim
  total-label: chalk.white.bold
  total-value: chalk.yellow.bold
  footer-value: chalk.blue.bold

up-down-style = (value, formatted) -->
  | value > 0 => chalk.green formatted
  | value < 0 => chalk.red formatted
  | otherwise => chalk.white.dim formatted

available-columns =
  name:
    display: ''
    style: chalk.cyan
    contents: (.currency.name)
  value:
    display: \Value
    style: chalk.blue.bold
    contents: (.value)
    formatter: \currency
  price:
    display: \Price
    style: chalk.magenta
    contents: (.price)
    formatter: \currency
  change:
    display: \Change
    conditional-style: up-down-style
    contents: (.change-vs-usd)
    formatter: \percent
  percentage:
    display: \Pct
    style: chalk.cyan.dim
    contents: (.percentage)
    formatter: \percent
  "1-hour-change":
    display: \1H
    conditional-style: up-down-style
    contents: -> parseFloat(it.currency.percent_change_1h) / 100
    formatter: \percent
  "24-hour-change":
    display: \24H
    conditional-style: up-down-style
    contents: -> parseFloat(it.currency.percent_change_24h) / 100
    formatter: \percent
  "7-day-change":
    display: \7D
    conditional-style: up-down-style
    contents: -> parseFloat(it.currency.percent_change_7d) / 100
    formatter: \percent
  count:
    display: \Count
    style: chalk.white.dim
    contents: (.count)
    formatter: \number
  symbol:
    display: 'Symbol'
    style: chalk.white
    contents: (.symbol)
  "value-eth":
    display: 'Value ETH'
    style: chalk.yellow
    contents: (.value-eth)
    formatter: \number
  "7-day-change-vs-eth":
    display: \7DVsETH
    conditional-style: up-down-style
    contents: (.change-week-vs-eth)
    formatter: \percent
  "value-btc":
    display: 'Value BTC'
    style: chalk.yellow
    contents: (.value-btc)
    formatter: \number
  "7-day-change-vs-btc":
    display: \7DVsBTC
    conditional-style: up-down-style
    contents: (.change-week-vs-btc)
    formatter: \percent
  "volume-24h":
    display: "Vol24hVsBTC"
    style: chalk.magenta.dim
    contents: (.volume)
    formatter: \percent
  rank:
    display: 'Rank'
    style: chalk.white
    contents: (.rank)
  "market-cap":
    display: 'Cap (M)'
    style: chalk.cyan.dim
    contents: (.market-cap)
    formatter: \bigcurrency
  "symbol-repeat":
    display: 'Symbol'
    style: chalk.white
    contents: (.symbol)

export available-columns
export class Renderer
  (@options) ->
    @options.columns =
      | @options.columns?.length => @options.columns
      | @options.value-only => <[ symbol value ]>
      | otherwise => <[ name value 1-hour-change 24-hour-change 7-day-change percentage ]>

    if @options.symbol
      @options.columns = @options.columns |> map -> switch it | \name => \symbol | otherwise => it

    if @options.show-count
      @options.columns.push \count unless \count in @options.columns

    @formatters = locale.get-formatters @options.convert, (@options.columns?0 is \symbol)

  format: (details) ~>
    column-data = @options.columns
      |> map ~> available-columns[it]
    data = details
      |> sort-by (.value)
      |> reverse
      |> map (detail) ~>
        column-data |> map ~>
          value = detail |> it.contents

          style =
            | it.style? => that
            | it.conditional-style? => value |> that
            | otherwise => id

          value
            |> @formatters[it.formatter ? 'default']
            |> style

    unless @options.value-only or @options.hide-header
      column-data |> map (.display) |> map style.header |> data.unshift

    return data

  add-footer: (portfolio, previous) ~~>
    market-cap-key = "total_market_cap_#{ @options.convert.toLowerCase! }"

    total-fx = portfolio.grand-total |> @formatters.currency |> style.total-value
    if !isNaN(portfolio.totals-change.fx) && portfolio.totals-change.fx != 0
      total-fx += " " + (portfolio.totals-change.fx |> @formatters.percent |> up-down-style portfolio.totals-change.fx)

    total-eth = portfolio.grand-total-eth |> @formatters.number |> style.total-value
    if !isNaN(portfolio.totals-change.eth) && portfolio.totals-change.eth != 0
      total-eth += " " + (portfolio.totals-change.eth |> @formatters.percent |> up-down-style portfolio.totals-change.eth)

    total-btc = portfolio.grand-total-btc |> @formatters.number |> style.total-value
    if !isNaN(portfolio.totals-change.btc) && portfolio.totals-change.btc != 0
      total-btc += " " + (portfolio.totals-change.btc |> @formatters.percent |> up-down-style portfolio.totals-change.btc)

    footer =
      * [ style.total-label(\Total:), total-fx ]
      * [ style.total-label("ETH:"), total-eth ]
      * [ style.total-label("BTC:"), total-btc ]
      * [ style.total-label("Cap Total (M):"), portfolio.global[market-cap-key] |> @formatters.bigcurrency |> style.footer-value ]
      * [ style.total-label("ETH:"), portfolio.ethereum_percentage_of_market_cap / 100 |> @formatters.percent |> style.footer-value ]
      * [ style.total-label("BTC:"), portfolio.global.bitcoin_percentage_of_market_cap / 100 |> @formatters.percent |> style.footer-value ]
      * [ style.total-label("Flippening:"), portfolio.flippening |> @formatters.percent |> style.footer-value ]
      * [ new Date! |> @formatters.time |> style.date ]
      * [ "Help: -h" |> style.date ]
    previous + (footer |> map join " " |> join " / ")

  render: (portfolio) ~>
    portfolio.details
    |> @format
    |> generate-table
    |> @add-footer portfolio
