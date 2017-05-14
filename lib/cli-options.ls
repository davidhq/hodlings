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
    .option "-w, --watch" "refresh data periodically"
    .option "-s, --symbol" "use symbol instead of full name"
    .option "-v, --value-only" "only display value (deprecated)"
    .option "-c, --show-count" "show amount of each coin (deprecated)"
    .option "-f, --file <f>" "file to use for holdings [~/.hodlings]" (homedir! + '/.hodlings')
    .option "-x, --convert <currency>" "currency to display", parse-currency, "USD"
    .option "--hide-header" "don't display table header"
    .option "--format <format>" "sets ouput format (table,csv) [table]", \table
    .option "--columns <columns>" "columns to display", parse-column-arguments, []
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

  if options.columns?length and options.value-only
    console.error "Incompatible options: --columns and --value-only"
    process.exit

  { Renderer, available-columns } = switch options.format.toLowerCase!
    | \table => require("./render-table")
    | \csv => require("./render-csv")
    | otherwise =>
      console.error "Unknown format: #{format}"
      process.exit -1

  options.Renderer = Renderer

  if options.available-columns
    console.log  "Supported columns:"
    available-columns |> keys |> join ", " |> console.log
    console.log "Or use 'all'."
    process.exit 0

  if options.columns |> any (is \all)
    options.columns = available-columns |> keys
  else
    bad-args = options.columns |> reject -> it of available-columns

    if bad-args.length then
      bad-args |> each -> console.error "Unknown column name: #{it}"
      process.exit -1

  return options
