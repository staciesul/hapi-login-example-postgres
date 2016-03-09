require('env2')('./config.env'); // see: https://github.com/dwyl/env2
var pg = require('pg');
var assert = require('assert');
module.exports = function create_tables (callback) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    assert(!err);
    var query = require('fs').readFileSync('../test/database_setup.sql', 'utf8');
    // see: http://stackoverflow.com/a/13823560/1148249
    client.query(query, function(err, result) {
      done();       // call `done()` to release the client back to the pool
      client.end(); // close connection to database
      return callback(err, result);
    });
  });
}
