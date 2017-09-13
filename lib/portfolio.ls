require! <[ chalk ]>
require! <[ ./locale ]>
require! 'fs' : { writeFileSync, readFileSync, existsSync}
require! 'prelude-ls' : { lines, map, split, filter, group-by, obj-to-pairs, sum, Obj }
require! 'path'
require! 'homedir'
obj-map = Obj.map

export
  ensure-main-exists: ->
    hodlings-file = path.join homedir!, ".hodlings"
    unless existsSync hodlings-file
      sourceFile = path.join __dirname, '../.hodlings-example'
      writeFileSync hodlings-file, readFileSync(sourceFile)
      console.log chalk.magenta("\nFile #{hodlings-file} not found, creating sample file...")
      console.log chalk.green("Please edit it with your actual portfolio!\n")

  load: (file) ->
    readFileSync file, \utf8
    |> lines
    |> map split "#" |> map (.0) # remove comments
    |> map split ":"
    |> map map (.trim!)
    |> filter (.1?)
    |> group-by (.0)
    |> obj-map -> it |> map (.1) |> map locale.get-parser! |> sum
    |> obj-to-pairs
    |> map ->
      coin: it.0
      amount: it.1
