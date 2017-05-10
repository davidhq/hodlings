require! <[ globalize cldr-data ]>
require! 'prelude-ls' : { Func, head, group-by, obj-to-pairs, map, filter, join }
memoize = Func.memoize

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

export
  current: current-locale

  check: locale-checker

  get-supported: memoize ->
    cldr-data.available-locales
    |> group-by -> it.split(\-).0
    |> obj-to-pairs
    |> map -> "#{it.0}: #{it.1 |> join ', '}"

  get-formatters: (locale, currency, short-form) ->
    globalize.load cldr-data.entire-main-for(locale), cldr-data.entire-supplemental!

    globalize-locale = globalize(locale)

    time-format =
      | short-form => skeleton: \Hm
      | otherwise => time: \medium

    return
      currency: globalize-locale.currency-formatter(currency, use-grouping: true)
      number: globalize-locale.number-formatter do
        maximum-fraction-digits: 4
        minimum-fraction-digits: 0
      percent: globalize-locale.number-formatter do
        style: \percent
        maximum-fraction-digits: 2
        minimum-fraction-digits: 2
      time: globalize-locale.date-formatter time-format
