require! <[ rest timespan ]>
require! 'prelude-ls' : { map, filter, lines, sum, each }
client = rest.wrap require('rest/interceptor/mime')
             .wrap require('rest/interceptor/errorCode')
             .wrap require('rest/interceptor/retry', ), initial: timespan.from-seconds(5).total-milliseconds!
             .wrap require('rest/interceptor/timeout'), timeout: timespan.from-seconds(80).total-milliseconds!
require! bluebird: Promise
require! <[ ./lib/portfolio ./lib/cli-options ]>

options = cli-options.get-options!

portfolio.ensure-exists options.file
renderer = new options.Renderer(options)

execute = (cb = console.log) ->
  portfolio.load(options.file)
  |> get-latest
  |> (.then renderer.render)
  |> (.then cb)

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
    |> (.catch !->)
  display-latest-values!

  interval = timespan.from-seconds(90).total-milliseconds!
  setInterval display-latest-values, interval
else
  execute!.catch !-> process.exit -1

function get-latest(hodlings)
  on-success = (global, currencies) ->
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

    details =
      hodlings
      |> map get-value
      |> filter (?)

    grand-total = details |> map (.value) |> sum
    details |> each -> it.percentage = it.value / grand-total

    return
      grand-total: grand-total
      details: details
      global: global

  convert-string =
    | options.convert is not /^USD$/i =>  "?convert=#{options.convert}"
    | otherwise => ""

  currencies-url = 'https://api.coinmarketcap.com/v1/ticker/'
  unless options.convert is /^USD$/i then currencies-url += "?convert=#{options.convert}"
  global-url = 'https://api.coinmarketcap.com/v1/global/'

  Promise.join do
    client({ path: global-url + convert-string }). then (.entity)
    client({ path: currencies-url + convert-string }). then (response) -> { [..symbol, ..] for response.entity }
    on-success
  .catch (e) !->
    console.error "!!! Error accessing service"
    throw e
