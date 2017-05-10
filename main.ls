require! <[ rest homedir chalk commander timespan moment fs ]>
require! 'prelude-ls' : { map, filter, sort-by, reverse, sum, take, lines, each }
require! table : { table, getBorderCharacters }
client = rest.wrap require('rest/interceptor/mime')
             .wrap require('rest/interceptor/errorCode')
             .wrap require('rest/interceptor/retry', ), initial: timespan.from-seconds(5).total-milliseconds!
             .wrap require('rest/interceptor/timeout'), timeout: timespan.from-seconds(80).total-milliseconds!

require! <[ ./lib/locale ./lib/portfolio ]>

style =
  header: chalk.white.bold.underline
  date: chalk.white.dim
  symbol: chalk.white
  value: chalk.yellow
  up: chalk.green
  down: chalk.red

options = commander
  .option "-w, --watch" "refresh data periodically"
  .option "-s, --symbol" "use symbol instead of full name"
  .option "-v, --value-only" "only display value"
  .option "-c, --show-count" "show amount of each coin"
  .option "-f, --file <f>" "file to use for holdings [~/.hodlings]" (homedir! + '/.hodlings')
  .option "-x, --convert <currency>" "currency to display", /^AUD|BRL|CAD|CHF|CNY|EUR|GBP|HKD|IDR|INR|JPY|KRW|MXN|RUB$/i, "USD"
  .option "--locale <locale>" "locale to use for formatting [#{locale.current}]", locale.check, locale.current
  .option "--supported-currencies" "shows list of supported currencies" ->
    console.log """
    Supported currencies: AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB
    """
    process.exit 0
  .option "--supported-locales" "shows list of supported locales" ->
    console.log  "Supported locales:"
    locale.get-supported! |> each console.log
    process.exit 0
  .option "--no-color" "don't display colors"
  .parse process.argv

portfolio.ensure-exists options.file

execute = (cb = console.log) -> get-latest portfolio.load(options.file), cb

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
    formatters = locale.get-formatters options.locale, options.convert, options.symbol

    get-details = ({ symbol, amount }) ->
      currency = currencies[symbol]
      unless currency? then
        console.error "Unknown coin: #{symbol}"
        return
      fx = options.convert.toLowerCase!
      value = (currency["price_#{fx}"] * amount)
      deltaStyle1h = if currency.percent_change_1h > 0 then style.up else style.down
      deltaStyle24h = if currency.percent_change_24h > 0 then style.up else style.down


      percent-parse = -> it |> parseFloat |> -> it / 100
      return
        message:
          * style.symbol(if options.symbol then currency.symbol else currency.name)
          * style.value(value |> formatters.currency)
          * deltaStyle1h(currency.percent_change_1h |> percent-parse |> formatters.percent)
          * deltaStyle24h(currency.percent_change_24h |> percent-parse |> formatters.percent)
          * style.symbol(amount |> formatters.number)
        value: value
        symbol: symbol
        amount: amount
        currency: currency

    details =
      hodlings
      |> map get-details
      |> filter (?)
      |> sort-by (.value)
      |> reverse

    grand-total = (details |> map (.value) |> sum |> formatters.currency)
    data = (details |> map (.message))
     ..push [style.symbol.bold(\Total:), style.value.bold(grand-total), '', '', '']

    if options.value-only then
      data = data |> map take 2
    else
      now = moment!.format(if options.symbol then "HH:mm" else \LTS)
      headers = [\Value, \1H%, \24H%, \Count] |> map style.header
        ..unshift(style.date(new Date! |> formatters.time))
      data.unshift headers

    data = data |> map take 4 unless options.show-count

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

  url = 'https://api.coinmarketcap.com/v1/ticker/'
  unless options.convert is /^USD$/i then url += "?convert=#{options.convert}"
  client({path: url}).then on-success, on-failure
