require! <[ rest homedir chalk commander timespan moment fs ]>
require! 'prelude-ls' : { map, filter, reject, each, group-by, sort-by, reverse, sum, split, take, join, lines, Obj, Str }
require! table : { table, getBorderCharacters }
require! 'fs' : { readFileSync }
client = rest.wrap require('rest/interceptor/mime')
             .wrap require('rest/interceptor/errorCode')
             .wrap require('rest/interceptor/retry', ), initial: timespan.from-seconds(5).total-milliseconds!
             .wrap require('rest/interceptor/timeout'), timeout: timespan.from-seconds(80).total-milliseconds!

_ =
  header: chalk.white.bold.underline
  date: chalk.white.dim
  symbol: chalk.white
  value: chalk.yellow
  up: chalk.green
  down: chalk.red

args = commander
  .option "-w, --watch" "refresh data periodically"
  .option "-s, --symbol" "use symbol instead of full name"
  .option "-v, --value-only" "only display value"
  .option "-c, --show-count" "show amount of each coin"
  .option "-f, --file <f>" "file to use for holdings [~/.hodlings]" (homedir! + '/.hodlings')
  .option "--no-color" "don't display colors"
  .parse process.argv

unless fs.existsSync args.file
  console.error "Cannot find file #{args.file}."
  process.exit -1

get-hodlings = ->
 readFileSync args.file, \utf8
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

execute = (cb = console.log) -> get-latest get-hodlings!, cb

if args.watch
  display = require(\charm)(process)
    .cursor false

  process.on \exit -> display.cursor true
  last-rows = 0

  display-latest-values = ->
    display.up(last-rows - 1).cursor(true) if last-rows
    execute ->
      display.erase(\down).write(it).cursor(false)
      last-rows := it |> Str.lines |> (.length)
  display-latest-values!

  interval = timespan.from-seconds(90).total-milliseconds!
  setInterval display-latest-values, interval
else
  execute!

function get-latest(hodlings, cb)
  on-success = (response) ->
    currencies = {[..symbol, ..] for response.entity}

    get-details = ({ symbol, amount }) ->
      currency = currencies[symbol]
      return unless currency?
      value = (currency.price_usd * amount)
      deltaStyle1h = if currency.percent_change_1h > 0 then _.up else _.down
      deltaStyle24h = if currency.percent_change_24h > 0 then _.up else _.down

      return
        message:
          * _.symbol(if args.symbol then currency.symbol else currency.name)
          * _.value("$" + value.toFixed(2))
          * deltaStyle1h(parseFloat(currency.percent_change_1h).toFixed(2) + "%")
          * deltaStyle24h(parseFloat(currency.percent_change_24h).toFixed(2) + "%")
          * _.symbol(amount.toFixed(3))
        value: value
        symbol: symbol
        amount: amount
        currency: currency

    details =
      hodlings
      |> map get-details
      |> sort-by (.value)
      |> reverse

    grand-total = (details |> map (.value) |> sum |> (.toFixed(2)))
    data = (details |> map (.message))
     ..push [_.symbol.bold(\Total:), _.value.bold("$" + grand-total), '', '', '']

    if args.value-only then
      data = data |> map take 2
    else
      now = moment!.format(if args.symbol then "HH:mm" else \LTS)
      headers = [\Value, \1H%, \24H%, \Count] |> map _.header
        ..unshift(_.date(now))
      data.unshift headers

    data = data |> map take 4 unless args.show-count

    cb table data, do
      border: getBorderCharacters \void
      drawHorizontalLine: ->
      columnDefault:
        alignment: \right
        paddingLeft: 0
        paddingRight: 2
      columns:
        0: alignment: \left

  on-failure = -> cb "!!! Error accessing data service"

  client({path: 'https://api.coinmarketcap.com/v1/ticker/'}).then on-success, on-failure
