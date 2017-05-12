require! <[ rest timespan ]>
require! 'prelude-ls' : { map, filter, lines }
client = rest.wrap require('rest/interceptor/mime')
             .wrap require('rest/interceptor/errorCode')
             .wrap require('rest/interceptor/retry', ), initial: timespan.from-seconds(5).total-milliseconds!
             .wrap require('rest/interceptor/timeout'), timeout: timespan.from-seconds(80).total-milliseconds!

require! <[ ./lib/portfolio ./lib/cli-options ]>

options = cli-options.get-options!

portfolio.ensure-exists options.file
renderer = new options.Renderer(options)

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
