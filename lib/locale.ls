require! <[ globalize cldr-data ]>
require! 'prelude-ls' : { Func, head, tail, group-by, obj-to-pairs, map, filter, join, id }
memoize = Func.memoize

globalize.load cldr-data.entire-supplemental!

get-locale-with-fallback = (locale) ->
  cldr-data.available-locales
  |> filter -> it.toLowerCase! in [locale.toLowerCase!, locale.split(\-).0.toLowerCase!]
  |> head

current-locale = (process.env.LANG?split(\.)?0?replace(\_, \-) ? \en) |> get-locale-with-fallback
globalize.load cldr-data.entire-main-for(current-locale)

locale-checker = (arg) ->
  locale = get-locale-with-fallback arg
  if locale? then that
  else
    console.log "Unknown locale #{arg}. Defaulting to #{current-locale}."
    current-locale

export
  current: current-locale
  set: ->
    current-locale := locale-checker it
    globalize.load cldr-data.entire-main-for(current-locale)

  get-supported: memoize ->
    cldr-data.available-locales
    |> group-by -> it.split(\-) |> head
    |> obj-to-pairs
    |> map -> "#{head it}: #{it |> tail |> join ', '}"

  get-parser: -> globalize(current-locale).number-parser!

  get-formatters: (currency, short-form) ->
    globalize-locale = globalize(current-locale)

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
      default: id
      parser: globalize-locale.number-parser!
