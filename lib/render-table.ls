require! <[ chalk moment ]>
require! <[ ./locale ]>
require! 'prelude-ls' : { flip, map, sum, take, sort-by, reverse }
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
  symbol: chalk.white
  value: chalk.yellow
  up: chalk.green
  down: chalk.red

export class TableRenderer
  (@options) ->
    @formatters = locale.get-formatters @options.convert, @options.symbol

  format: (details) ~>
    get-columns = ({ currency, value, amount, symbol }) ~>
      deltaStyle1h = if currency.percent_change_1h > 0 then style.up else style.down
      deltaStyle24h = if currency.percent_change_24h > 0 then style.up else style.down

      percent-parse = -> it |> parseFloat |> -> it / 100
      return
        * style.symbol(if @options.symbol then currency.symbol else currency.name)
        * style.value(value |> @formatters.currency)
        * deltaStyle1h(currency.percent_change_1h |> percent-parse |> @formatters.percent)
        * deltaStyle24h(currency.percent_change_24h |> percent-parse |> @formatters.percent)
        * style.symbol(amount |> @formatters.number)

    grand-total = (details |> map (.value) |> sum |> @formatters.currency)
    data = (details |> map get-columns)
     ..push [style.symbol.bold(\Total:), style.value.bold(grand-total), '', '', '']

    if @options.value-only then
      data = data |> map take 2
    else
      now = moment!.format(if @options.symbol then "HH:mm" else \LTS)
      headers = [\Value, \1H%, \24H%, \Count] |> map style.header
        ..unshift(style.date(new Date! |> @formatters.time))
      data.unshift headers

    data = data |> map take 4 unless @options.show-count
    return data

  render: (data, cb) ~>
    data
    |> sort-by (.value)
    |> reverse
    |> @format
    |> generate-table
    |> cb

