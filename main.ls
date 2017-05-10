require! <[ rest homedir commander timespan ]>
require! 'prelude-ls' : { map, filter, lines, each, split, partition, join, keys }
client = rest.wrap require('rest/interceptor/mime')
             .wrap require('rest/interceptor/errorCode')
             .wrap require('rest/interceptor/retry', ), initial: timespan.from-seconds(5).total-milliseconds!
             .wrap require('rest/interceptor/timeout'), timeout: timespan.from-seconds(80).total-milliseconds!

require! <[ ./lib/locale ./lib/portfolio ]>
require! './lib/render-table' : { TableRenderer, available-columns }

parse-column-argument = (arg) ->
  [args, bad-args] =
    arg
    |> split \,
    |> map (.toLowerCase!)
    |> partition -> it of available-columns

  if bad-args.length then
    bad-args |> each -> console.error "Unknown column name: #{it}"
    process.exit -1
  return args

options = commander
  .option "-w, --watch" "refresh data periodically"
  .option "-s, --symbol" "use symbol instead of full name"
  .option "-v, --value-only" "only display value (deprecated)"
  .option "-c, --show-count" "show amount of each coin (deprecated)"
  .option "-f, --file <f>" "file to use for holdings [~/.hodlings]" (homedir! + '/.hodlings')
  .option "-x, --convert <currency>" "currency to display", /^AUD|BRL|CAD|CHF|CNY|EUR|GBP|HKD|IDR|INR|JPY|KRW|MXN|RUB$/i, "USD"
  .option "--hide-header" "don't display table header"
  .option "--columns <columns>" "columns to display [name,value,1-hour-change,24-hour-change]", parse-column-argument, []
  .option "--locale <locale>" "locale to use for formatting [#{locale.current}]", locale.set, locale.current
  .option "--supported-currencies" "shows list of supported currencies" ->
    console.log """
    Supported currencies: AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB
    """
    process.exit 0
  .option "--supported-locales" "shows list of supported locales" ->
    console.log  "Supported locales:"
    locale.get-supported! |> each console.log
    process.exit 0
  .option "--available-columns" "shows list of columns" ->
    console.log  "Supported columns:"
    available-columns |> keys |> join ", " |> console.log
    process.exit 0
  .option "--no-color" "don't display colors"
  .parse process.argv

if options.columns?length and options.value-only
  console.error "Incompatible options: --columns and --value-only"
  process.exit

portfolio.ensure-exists options.file

renderer = new TableRenderer(options)
execute = (cb = console.log) ->
  (data) <- get-latest portfolio.load(options.file)
  renderer.render data, cb

if options.watch
  display = require(\charm)(process)
    .cursor false

  process.on \exit -> display.cursor true
  last-rows = 0

  display-latest-values = ->
    display.up(last-rows - 1).cursor(true) if last-rows
    execute ->
      display.erase(\down).write(it).cursor(false)
      last-rows := it |> lines |> (.length)
  display-latest-values!

  interval = timespan.from-seconds(90).total-milliseconds!
  setInterval display-latest-values, interval
else
  execute!

function get-latest(hodlings, cb)
  on-success = (response) ->
    currencies = {[..symbol, ..] for response.entity}

    get-value = ({ symbol, amount }) ->
      currency = currencies[symbol]
      unless currency? then
        console.error "Unknown coin: #{symbol}"
        return

      fx = options.convert.toLowerCase!
      price = currency["price_#{fx}"] |> parseFloat
      price-btc = currency.price_btc |> parseFloat
      amount-for-currency = (*) amount
      value = amount-for-currency price
      value-btc = amount-for-currency price-btc
      return
        count: amount
        value: value
        value-btc: value-btc
        price: price
        price-btc: price-btc
        symbol: symbol
        amount: amount
        market-cap: currency["market_cap_#{fx}"] |> parseFloat
        currency: currency

    hodlings
    |> map get-value
    |> filter (?)
    |> cb

  on-failure = -> cb "!!! Error accessing data service"

  url = 'https://api.coinmarketcap.com/v1/ticker/'
  unless options.convert is /^USD$/i then url += "?convert=#{options.convert}"
  client({path: url}).then on-success, on-failure
