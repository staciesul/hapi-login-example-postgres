require('env2')('./config.env'); // see: https://github.com/dwyl/env2
var pg = require('pg');
var assert = require('assert');
module.exports = function create_database (callback) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    assert(!err);
    // first drop any tables you had before so we have a clean database:
    var query = 'drop schema public cascade; create schema public; ';
    // then create the
    query += 'CREATE TABLE users(id SERIAL PRIMARY KEY, '
    query += 'email VARCHAR(254) UNIQUE, password VARCHAR(60) not null)';
    client.query(query, function(err, result) {
      done();       // call `done()` to release the client back to the pool
      client.end(); // close connection to database
      return callback(err, result);
    });
  });
}
