var test   = require('tape');
// we display the file (name) in each test name for stack trace
var dir   = __dirname.split('/')[__dirname.split('/').length-1];
var file  = dir + __filename.replace(__dirname, '') + ' -> ';

var server = require("../lib/server.js"); // load hapi server (the easy way!)

/************************* TESTS ***************************/
test(file + "GET /register (expect to see reg form)", function(t) {
  var options = {
    method: "GET",
    url: "/register"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Server is working.");
    server.stop(function(){ t.end() });
  });
});

test(file+'Attempt to submit a registration without password', function(t){
  var options = {
    method: "POST",
    url: "/register",
    payload : { email:'this@here.net' }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode
    t.equal(code, 400, 'Register without password fails -> '+code);
    server.stop(function(){ t.end() });
  });
})

test(file+'Attempt to register with unrecognised field', function(t){
  var options = {
    method: "POST",
    url: "/reg",
    payload : { email:'this@here.net', password: 'pass4567', id:123 }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode
    t.equal(code, 400, 'Register with unknown field fails -> '+code);
    server.stop(function(){ t.end() });
  });
})

var person = {
  "email" : 'dwyl.test+auth_basic' +Math.random()+'@gmail.com',
  "password":"EverythingIsAwesome"
}

test.only(file+"Successfully register with email and password", function(t) {
  var options = {
    method: "POST",
    url: "/register",
    payload : { email:'this@here.net', password: 'pass4567' }
  };

  server.inject(options, function(response) {
    // console.log(response)
    t.equal(response.statusCode, 200, "Register worked with email and password");
    server.stop(function(){ t.end() });
  });
});
