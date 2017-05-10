require! 'fs' : { readFileSync, existsSync}
require! 'prelude-ls' : { lines, map, split, filter, group-by, obj-to-pairs, sum, Obj }
obj-map = Obj.map

export
  ensure-exists: (file) ->
    unless existsSync file
      console.error "Cannot find file #{options.file}."
      process.exit -1

  load: (file) ->
   readFileSync file, \utf8
   |> lines
   |> map split "#" |> map (.0) # remove comments
   |> map split ":"
   |> map map (.trim!)
   |> filter (.1?)
   |> group-by (.0)
   |> obj-map -> it |> map (.1) |> map parseFloat |> sum
   |> obj-to-pairs
   |> map ->
      symbol: it.0
      amount: it.1
