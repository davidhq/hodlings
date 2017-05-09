require! <[ rest homedir chalk ]>
require! 'prelude-ls' : { map, filter, reject, each, group-by, sort-by, reverse, sum, split, join, lines, Obj, Str }
require! table : { table, getBorderCharacters }
require! 'fs' : { readFileSync }
client = rest.wrap require('rest/interceptor/mime')

_ =
  header: chalk.white.bold
  symbol: chalk.white
  value: chalk.yellow
  up: chalk.green
  down: chalk.red

hodlings = readFileSync homedir! + '/.hodlings', \utf8
         |> Str.lines
         |> map split "#" |> map (.0) # remove comments
         |> map split ":"
         |> map map (.trim!)
         |> filter (.1?)
         |> group-by (.0)
         |> Obj.map -> it |> map (.1) |> map parseFloat
         |> Obj.map sum
         |> Obj.obj-to-pairs
         |> map ->
            symbol: it.0
            amount: it.1

response <- client({path: 'https://api.coinmarketcap.com/v1/ticker/'}).then
currencies = {[..symbol, ..] for response.entity}

get-details = ({ symbol, amount }) ->
  currency = currencies[symbol]
  return unless currency?
  value = (currency.price_usd * amount)
  deltaStyle1h = if currency.percent_change_1 > 0 then _.up else _.down
  deltaStyle24h = if currency.percent_change_24h > 0 then _.up else _.down

  return
    message:
      * _.symbol(currency.name)
      * _.value("$" + value.toFixed(2))
      * deltaStyle1h(currency.percent_change_1h + "%")
      * deltaStyle24h(currency.percent_change_24h + "%")
    value: value
    symbol: symbol
    amount: amount
    currency: currency

details =
  hodlings
  |> map get-details
  |> sort-by (.value)
  |> reverse

data = (details |> map (.message))
 ..unshift (<[ Coin Value 1H% 24H% ]> |> map _.header)
 ..push [_.symbol(\Total:), _.value("$" + (details |> map (.value) |> sum |> (.toFixed(2)))), '', '']

console.log table data, do
  border: getBorderCharacters \void
  drawHorizontalLine: (index, size) -> index == size - 1
  columnDefault:
    alignment: \right
    paddingLeft: 0
    paddingRight: 2
  columns:
    0: alignment: \left
