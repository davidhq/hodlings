require! <[ rest homedir chalk commander timespan ]>
require! 'prelude-ls' : { map, filter, reject, each, group-by, sort-by, reverse, sum, split, take, join, lines, Obj, Str }
require! table : { table, getBorderCharacters }
require! 'fs' : { readFileSync }
client = rest.wrap require('rest/interceptor/mime')

_ =
  header: chalk.white.bold
  symbol: chalk.white
  value: chalk.yellow
  up: chalk.green
  down: chalk.red

args = commander
  .option "-w, --watch" "refresh data periodically"
  .option "-s, --symbol" "use symbol instead of full name"
  .option "-v, --value-only" "don't display gain/loss columns"
  .option "--no-color" "don't display colors"
  .parse process.argv


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


if args.watch
  display = require(\charm)(process)
    .push!
    .cursor false
    .remove-all-listeners \^C
    .on \^C ->
      display.cursor true
      process.exit!

  display-latest-values = ->
    display.pop!
    display.push!
    get-latest console.log
  display-latest-values!

  interval = timespan.from-seconds(90).total-milliseconds!
  setInterval display-latest-values, interval
else
  get-latest console.log

function get-latest(cb)
  response <- client({path: 'https://api.coinmarketcap.com/v1/ticker/'}).then
  currencies = {[..symbol, ..] for response.entity}

  get-details = ({ symbol, amount }) ->
    currency = currencies[symbol]
    return unless currency?
    value = (currency.price_usd * amount)
    deltaStyle1h = if currency.percent_change_1h > 0 then _.up else _.down
    deltaStyle24h = if currency.percent_change_24h > 0 then _.up else _.down

    return
      message:
        * _.symbol(if args.short then currency.symbol else currency.name)
        * _.value("$" + value.toFixed(2))
        * deltaStyle1h(parseFloat(currency.percent_change_1h).toFixed(2) + "%")
        * deltaStyle24h(parseFloat(currency.percent_change_24h).toFixed(2) + "%")
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
   ..push [_.symbol.bold(\Total:), _.value.bold("$" + (details |> map (.value) |> sum |> (.toFixed(2)))), '', '']

  if args.value-only then
    data = data |> map take 2
  else
    data.unshift (["" \Value \1H% \24H%] |> map _.header)

  cb table data, do
    border: getBorderCharacters \void
    drawHorizontalLine: ->
    columnDefault:
      alignment: \right
      paddingLeft: 0
      paddingRight: 2
    columns:
      0: alignment: \left
