require! 'prelude-ls' : { map, reject, each, split, join, keys, unique, any }
require! <[ commander homedir ./locale ]>

export get-options = ->
  parse-column-arguments = -> it |> split \, |> map (.toLowerCase!) |> unique
  parse-currency = ->
    | it is /^AUD|BRL|CAD|CHF|CNY|EUR|GBP|HKD|IDR|INR|JPY|KRW|MXN|RUB$/i => it.to-upper-case!
    | otherwise =>
      console.error "Unknown currency: #{it}"
      process.exit -1

  options = commander
    .option "-w, --watch" "refresh data periodically every 10 min"
    .option "-f, --file <f>" "file to use for hodlings [~/.hodlings]" (homedir! + '/.hodlings')
    .option "-x, --convert <currency>" "currency to display (usd, eur, cny...)", parse-currency, "USD"
    .option "--columns <columns>" "columns to display", parse-column-arguments, []
    .option "--eth" "focus on eth, hide the bitcoin-specific columns (value-btc, 7-day-change-vs-btc)"
    .option "--btc" "focus on btc, hide the ethereum-specific columns (value-eth, 7-day-change-vs-eth)"
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
    .option "--available-columns" "shows list of columns"
    .option "--no-color" "don't display colors"
    .parse process.argv

  { Renderer, available-columns } = require("./render-table")

  options.Renderer = Renderer

  if options.available-columns
    console.log  "Supported columns:"
    available-columns |> keys |> join ", " |> console.log
    process.exit 0

  if options.columns.length == 0 || (options.columns |> any (is \all))
    options.columns = available-columns |> keys
    if(options.btc)
      options.columns = options.columns |> reject -> it == "value-eth" || it == "7-day-change-vs-eth"
    if(options.eth)
      options.columns = options.columns |> reject -> it == "value-btc" || it == "7-day-change-vs-btc"
  else
    bad-args = options.columns |> reject -> it of available-columns

    if bad-args.length then
      bad-args |> each -> console.error "Unknown column name: #{it}"
      process.exit -1

  return options
