require! <[ chalk ]>
require! <[ ./locale ]>
require! 'prelude-ls' : { flip, map, sum, take, sort-by, reverse, each }
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

up-down-style = (value, formatted) -->
  | value > 0 => chalk.green formatted
  | value < 0 => chalk.red formatted
  | otherwise => chalk.white.dim formatted

available-columns =
  symbol:
    display: ''
    style: chalk.white
    contents: (.symbol)
  name:
    display: ''
    style: chalk.white
    contents: (.currency.name)
  value:
    display: \Value
    style: chalk.yellow
    contents: (.value)
    formatter: \currency
  "value-btc":
    display: 'Value (BTC)'
    style: chalk.yellow
    contents: (.value-btc)
    formatter: \number
  "1-hour-change":
    display: \1H%
    conditional-style: up-down-style
    contents: -> parseFloat(it.currency.percent_change_1h) / 100
    formatter: \percent
  "24-hour-change":
    display: \24H%
    conditional-style: up-down-style
    contents: -> parseFloat(it.currency.percent_change_24h) / 100
    formatter: \percent
  count:
    display: \Count
    style: chalk.white.dim
    contents: (.count)
    formatter: \number
  price:
    display: \Price
    style: chalk.yellow
    contents: (.price)
    formatter: \currency
  "price-btc":
    display: 'Price (BTC)'
    style: chalk.yellow
    contents: (.price-btc)
    formatter: \number
  "market-cap":
    display: 'Mkt Cap'
    style: chalk.magenta
    contents: (.market-cap)
    formatter: \currency

export available-columns
export class TableRenderer
  (@options) ->
    @options.columns =
      | @options.columns?.length => @options.columns
      | @options.value-only => <[ symbol value ]>
      | otherwise => <[ symbol value 1-hour-change 24-hour-change ]>

    if @options.symbol
      @options.columns = @options.columns |> map -> switch it | \name => \symbol | otherwise => it

    if @options.show-count
      @options.columns.push \count unless \count in @options.columns

    @formatters = locale.get-formatters @options.convert, (@options.columns?0 is \symbol)

  format: (details) ~>
    column-data = @options.columns
    |> map ~> available-columns[it]
    data = details |> map (detail) ~>
      column-data |> map ~>
        value = detail |> it.contents

        style =
          | it.style? => that
          | it.conditional-style? => value |> that
          | otherwise => id

        value
          |> @formatters[it.formatter ? 'default']
          |> style

    grand-total = (details |> map (.value) |> sum |> @formatters.currency)
    footer = [''] * @options.columns.length
      ..0 = style.total-label(\Total:)
      ..1 = style.total-value(grand-total)
    data.push footer

    unless @options.value-only or @options.hide-header
      headers = (column-data |> map (.display)) |> map style.header
        ..0 = style.date(new Date! |> @formatters.time)
      data.unshift headers

    return data

  render: (data, cb) ~>
    data
    |> sort-by (.value)
    |> reverse
    |> @format
    |> generate-table
    |> cb

