require('./_create_table.test.js'); // create the required database tables
var test   = require('tape');
var JWT = require('jsonwebtoken'); // https://github.com/dwyl/learn-json-web-tokens
// we display the file (name) in each test name for stack trace
var dir   = __dirname.split('/')[__dirname.split('/').length-1];
var file  = dir + __filename.replace(__dirname, '') + ' -> ';

var server = require("../lib/server.js"); // load hapi server (the easy way!)

/************************* TESTS ***************************/
test(file + "GET / (confirm server is working with a basic test)", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Server is working.");
    t.end();
  });
});

var test_email = 'dwyl.test+register@gmail.com';

test(file+"/login without password", function(t) {
  var options = {
    method: "POST",
    url: "/login",
    payload : { email: test_email }
  };

  server.inject(options, function(response) {
    // console.log(response)
    t.equal(response.statusCode, 400, "Password is required!");
    t.end()
  });
});

test(file+"/login without email (expect fail)", function(t) {
  var options = {
    method: "POST",
    url: "/login",
    payload : { password: 'Jimmy' }
  };

  server.inject(options, function(response) {
    // console.log(response)
    t.equal(response.statusCode, 400, "Email is required!");
    t.end()
  });
});

test(file+"/login with correct email but incorrect password", function(t) {
  // first register a new account
  var email = 'dwyl.test+' + Math.floor(Math.random()*1000000)  + '@gmail.com';
  console.log(email);

  var options = {
    method: "POST",
    url: "/register",
    payload : { email: email, password: 'pinkfluffyunicorns' }
  };

  server.inject(options, function(response) {
    console.log(response.statusCode);
    t.equal(response.statusCode, 200, "Registration succeeded for: "+email);
    options.url = '/login'; // now login
    options.payload.password = 'incorrect';
    server.inject(options, function(response) {
      t.equal(response.statusCode, 401, "Login Faild (incorrect password)");
      t.end();
    });
  });
});

test(file+"/login with unregistered email address", function(t) {
  var email = 'dwyl.test+' + Math.floor(Math.random()*1000000)  + '@gmail.com';
  var options = {
    method: "POST",
    url: "/login",
    payload : { email: email, password: 'pinkfluffyunicorns' }
  }; // this user is NOT registered expect
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Login Faild (email not registered)");
    t.end();
  });
});

var COOKIE;
test(file+"/login With Valid Data (Success Test)", function(t) {
  // first register a new account
  var email = 'dwyl.test+' + Math.floor(Math.random()*1000000)  + '@gmail.com';
  // console.log(email);
  var options = {
    method: "POST",
    url: "/register",
    payload : { email: email, password: 'supersecret' }
  };
  server.inject(options, function(response) {
    console.log(response.statusCode);
    t.equal(response.statusCode, 200, "Registration succeeded for: "+email);
    options.url = '/login'; // now login
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200, "Login Succeeded!");
      COOKIE = response.headers['set-cookie'][0];
      var token = response.headers['set-cookie'][0].replace('token=', '');
      // console.log(token)
      var decoded = JWT.decode(token);
      // console.log(decoded);
      t.equal(decoded.sid.length, 36, 'User ID: ' + decoded.sid);
      // t.end();
      var opts = { method: 'GET', url: '/admin', headers: { cookie: COOKIE }}
      server.inject(opts, function(response){
        // console.log(' - - - - - - - - - - - - - - - - - - /admin response:');
        // console.log(response.result);
        t.equal(response.statusCode, 200, "Admin Page Viewed");
        t.end();
      });
    });
  });
});


test.onFinish(function () {
  server.stop(function(){});
})
