require! <[ csv-stringify ]>
require! 'prelude-ls' : { map, keys }

available-columns =
  name:
    display: 'Name'
    contents: (.currency.name)
  symbol:
    display: 'Symbol'
    contents: (.symbol)
  value:
    display: \Value
    contents: (.value)
  "value-btc":
    display: 'Value (BTC)'
    contents: (.value-btc)
  "1-hour-change":
    display: \1H%
    contents: -> parseFloat(it.currency.percent_change_1h) / 100
  "24-hour-change":
    display: \24H%
    contents: -> parseFloat(it.currency.percent_change_24h) / 100
  count:
    display: \Count
    contents: (.count)
  price:
    display: \Price
    contents: (.price)
  "price-btc":
    display: 'Price (BTC)'
    contents: (.price-btc)
  "market-cap":
    display: 'Mkt Cap'
    contents: (.market-cap)

export available-columns
export class Renderer
  (@options) ->
    @options.columns =
      | @options.columns?.length => @options.columns
      | @options.value-only => <[ symbol value ]>
      | otherwise => available-columns |> keys

  render: (cells, cb) ~>
    columns = @options.columns |> map -> available-columns[it]
    rows = cells |> map (cell) -> columns |> map (.contents cell)
    header = columns |> map (.display)
    csv-stringify rows, { columns: header, header: true }, (err, output) ->
      cb output
