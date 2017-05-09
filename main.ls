require! <[ rest homedir chalk commander timespan moment fs ]>
require! <[ globalize cldr-data ]>
require! 'prelude-ls' : { map, filter, head, reject, each, group-by, sort-by, reverse, sum, split, take, join, lines, Obj, Str }
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

get-locale-with-fallback = (locale) ->
  cldr-data.available-locales
  |> filter -> it.toLowerCase! in [locale.toLowerCase!, locale.split(\-).0.toLowerCase!]
  |> head

current-locale = (process.env.LANG?split(\.)?0?replace(\_, \-) ? \en) |> get-locale-with-fallback

locale-checker = (arg) ->
  locale = get-locale-with-fallback arg
  if locale? then that
  else
    console.log "Unknown locale #{arg}. Defaulting to #{current-locale}."
    current-locale

args = commander
  .option "-w, --watch" "refresh data periodically"
  .option "-s, --symbol" "use symbol instead of full name"
  .option "-v, --value-only" "only display value"
  .option "-c, --show-count" "show amount of each coin"
  .option "-f, --file <f>" "file to use for holdings [~/.hodlings]" (homedir! + '/.hodlings')
  .option "-x, --convert <currency>" "currency to display", /^AUD|BRL|CAD|CHF|CNY|EUR|GBP|HKD|IDR|INR|JPY|KRW|MXN|RUB$/i, "USD"
  .option "--locale <locale>" "locale to use for formatting [#{current-locale}]", locale-checker, current-locale
  .option "--supported-currencies" "shows list of supported currencies" ->
    console.log """
    Supported currencies: AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB
    """
    process.exit 0
  .option "--supported-locales" "shows list of supported locales" ->
    console.log  "Supported locales:"
    cldr-data.available-locales
    |> group-by -> it.split(\-).0
    |> Obj.obj-to-pairs
    |> map -> "#{it.0}: #{it.1 |> join ', '}"
    |> each console.log
    process.exit 0
  .option "--no-color" "don't display colors"
  .parse process.argv

unless fs.existsSync args.file
  console.error "Cannot find file #{args.file}."
  process.exit -1

globalize.load cldr-data.entire-main-for(args.locale), cldr-data.entire-supplemental!

globalize-locale = globalize(args.locale)
currency-formatter = globalize-locale.currency-formatter(args.convert)
number-formatter = globalize-locale.number-formatter do
  maximum-fraction-digits: 4
  minimum-fraction-digits: 0
pct-formatter = globalize-locale.number-formatter do
  style: \percent
  maximum-fraction-digits: 2
  minimum-fraction-digits: 2
time-format =
  if args.symbol
    skeleton: \Hm
  else
    time: \medium
time-formatter = globalize-locale.date-formatter time-format
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
      fx = args.convert.toLowerCase!
      value = (currency["price_#{fx}"] * amount)
      deltaStyle1h = if currency.percent_change_1h > 0 then _.up else _.down
      deltaStyle24h = if currency.percent_change_24h > 0 then _.up else _.down

      percent-parse = -> it |> parseFloat |> -> it / 100
      return
        message:
          * _.symbol(if args.symbol then currency.symbol else currency.name)
          * _.value(value |> currency-formatter)
          * deltaStyle1h(currency.percent_change_1h |> percent-parse |> pct-formatter)
          * deltaStyle24h(currency.percent_change_24h |> percent-parse |> pct-formatter)
          * _.symbol(amount |> number-formatter)
        value: value
        symbol: symbol
        amount: amount
        currency: currency

    details =
      hodlings
      |> map get-details
      |> sort-by (.value)
      |> reverse

    grand-total = (details |> map (.value) |> sum |> currency-formatter)
    data = (details |> map (.message))
     ..push [_.symbol.bold(\Total:), _.value.bold(grand-total), '', '', '']

    if args.value-only then
      data = data |> map take 2
    else
      now = moment!.format(if args.symbol then "HH:mm" else \LTS)
      headers = [\Value, \1H%, \24H%, \Count] |> map _.header
        ..unshift(_.date(new Date! |> time-formatter))
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

  url = 'https://api.coinmarketcap.com/v1/ticker/'
  unless args.convert is /^USD$/i then url += "?convert=#{args.convert}"
  client({path: url}).then on-success, on-failure
