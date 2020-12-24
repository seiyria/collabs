const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const nearley = require('nearley');
const grammar = require('./collab');

if(!argv.file) {
  console.error('No --file passed in.');
  return;
}

if(!argv.baseFilename) {
  console.error('No --baseFilename passed in.');
  return;
}

if(!argv.format) {
  console.error('No --format passed in.');
  return;
}

if(!fs.existsSync(`./formats/${argv.format}.js`)) {
  console.error(`Invalid --format. asd` + argv.format);
  return;
}

if(!argv.namespace) {
  argv.namespace = ''
}

const format = require(`./formats/${argv.format}.js`);

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const parseGrammar = fs.readFileSync(argv.file, 'UTF-8')
  .replace(/\s*#.+$/gm, ''); // strip comments

parser.feed(parseGrammar);

// strip out nulls, etc
const results = parser.results
  .filter(Boolean);

if(results.length > 1) {
  console.error(`Error! Error! Ambiguous parse detected. Something needs fixing.`);
  return;
}

const fixedResults = results[0].filter(Boolean);

const outputs = format(fixedResults, argv.namespace, argv.baseFilename);
outputs.forEach(output => {
  fs.writeFileSync(output.filename, output.contents);
});
