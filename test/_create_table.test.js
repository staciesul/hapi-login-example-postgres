require('env2')('./config.env'); // see: https://github.com/dwyl/env2
var test = require('tape');
// we display the file (name) in each test name for stack trace
var dir = __dirname.split('/')[__dirname.split('/').length-1];
var file = dir + __filename.replace(__dirname, '') + ' -> ';

var _pg = '../node_modules/hapi-postgres-connection/node_modules/pg/lib/index.js'
var pg = require(_pg); // manual connection just for this
var assert = require('assert');

function create_tables (callback) {
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    assert(!err); // if db connection fails then EXPLODE!!
    var file = require('path').resolve(__dirname + '/database_setup.sql');
    var query = require('fs').readFileSync(file, 'utf8').toString();
    console.log('\n', query);
    client.query(query, function(err, result) {
      // done();       // call `done()` to release the client back to the pool
      client.end(); // close connection to database
      return callback(err, result);
    });
  });
}

test('Create "people" table in test databse', function (t) {
  create_tables(function (err, data) {
    t.equal(data.command, 'INSERT', 'DB Table Created & Test Data Inserted');
    t.end();
  })
});
