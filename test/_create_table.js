require('env2')('./config.env'); // see: https://github.com/dwyl/env2
var assert = require('assert');
// avoid having pg as a dependency by simply requiring the nested dependcy
var _pg = '../node_modules/hapi-postgres-connection/node_modules/pg/lib/index.js';
var pg = require(_pg); // manual connection just for this

function create_tables (callback) {
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    assert(!err); // die if we cannot connect
    var file = require('path').resolve(__dirname + '/database_setup.sql');
    var query = require('fs').readFileSync(file, 'utf8').toString();
    console.log('\n', query);
    client.query(query, function(err, result) {
      client.end(); // close connection to database
      require('decache')(_pg);
      return callback(err, result);
    });
  });
}

create_tables(function (err, data) {
  console.log(data.command, 'DB Table Created & Test Data Inserted');
});
