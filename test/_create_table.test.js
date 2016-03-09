var test = require('tape');
// we display the file (name) in each test name for stack trace
var dir = __dirname.split('/')[__dirname.split('/').length-1];
var file = dir + __filename.replace(__dirname, '') + ' -> ';

var create = require('../lib/pg_create_table.js');

test('Create "users" table in test databse', function (t) {
  create(function (err, data){
    console.log(data);
    t.equal(data.command, 'CREATE');
    t.end();
  })
});
