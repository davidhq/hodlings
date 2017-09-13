#!/usr/bin/env node

require('livescript');

var app = require('./app')('');
const config = require('config');
const path = require('path');
const fs = require('fs');
var copyPaste = require('copy-paste');
var colors = require('colors');

// Parse command line options
var program = require('commander');

var pkg = require(path.join(__dirname, 'package.json'));

program
  .version(pkg.version)
  .description('Share your crypto beliefs over direct connections')
  .option('-p, --port <port>', 'Port on which to listen to (defaults to 3000)', parseInt)
  .option('-P, --private', 'Only local share')
  .option('-nc, --nocopy', 'Copy url for public sharing to clipboard')
  .parse(process.argv);

// const portfolio = require('./lib/portfolio');
// const cliOptions = require('./lib/cli-options');
// const options = cliOptions.getOptions();
// console.log(options.file);
// console.log(portfolio.load(options.file));

const lastValuesFile = path.join(__dirname, './data/data.json');

if (fs.existsSync(lastValuesFile)) {
  const lastValues = JSON.parse(fs.readFileSync(lastValuesFile));
  console.log(lastValues);

  app.get('/data', (req, res) => {
    res.send(lastValues)
  })
}

var port = program.port || config.get('port') || 3000;

if (!program.private) {
  const ngrok = require('ngrok');
  ngrok.connect(port, function(err, url) {
    if (err) {
      console.log(err);
      console.log(colors.red('You probably have a tunnel running already'));
      process.exit();
    }
    let copied = '';
    if (!program.nocopy) {
      copied = '(copied to clipboard)';
      copyPaste.copy(url);
    }
    console.log(`Public URL: ${colors.yellow(url)} ${colors.green(copied)}`);
  });
}

var server = app.listen(port, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Hodlings listening at http://%s:%s', host, port);
});
