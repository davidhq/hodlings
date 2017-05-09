require! <[ rest homedir chalk ]>
require! 'prelude-ls' : { map, filter, reject, each, group-by, sort-by, reverse, sum, split, join, lines, Obj, Str }
require! 'fs' : { readFileSync }
client = rest.wrap require('rest/interceptor/mime')

_ =
  symbol: chalk.white.bold
  value: chalk.white
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

get-value = (currency, amount) -> (currency.price_usd * amount)
get-details = ({ symbol, amount }) ->
  currency = currencies[symbol]
  return unless currency?
  value = get-value currency, amount
  deltaStyle = if currency.percent_change_24h > 0 then _.up else _.down
  return
    message: _.symbol(symbol) + ": \t" + _.value("$" + value.toFixed(2)) + " " + deltaStyle(currency.percent_change_24h + "%")
    value: value
    symbol: symbol
    amount: amount
    currency: currency

details =
  hodlings
  |> map get-details

details
  |> sort-by (.value)
  |> reverse
  |> map (.message)
  |> each console.log

details
  |> map (.value)
  |> sum
  |> -> console.log _.symbol("TOTAL") + ": \t" + _.value("$" + it.toFixed(2))
