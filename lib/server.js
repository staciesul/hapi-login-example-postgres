require('env2')('./config.env'); // see: https://github.com/dwyl/env2
var Hapi   = require('hapi');    // https://github.com/nelsonic/learn-hapi
var Joi    = require('joi');
var Vision = require('vision');
var server = new Hapi.Server() //{ debug: {"request": ["error", "uncaught"]} })
var assert = require('assert');

var custom_fields  = require('./model');   // fields required to register/login

var register_handler = require('./register_handler');
var register_opts = {
  fields: custom_fields,
  handler: register_handler,
  fail_action_handler: register_handler
};  // set options when registering the plugin

var login_handler = require('./login_handler'); // handler for login
var login_opts = {
  fields: custom_fields,
  handler: login_handler,
  fail_action_handler: login_handler
};

server.connection({ port: process.env.PORT });
server.register([Vision,
  { register: require('hapi-register'), options:register_opts },
  { register: require('hapi-login'), options:login_opts }], function (err) {
  assert(!err, 'Failed to load plugin: ', err); // FATAL ERROR!
  server.views({
      engines: { html: require('handlebars') },
      path: __dirname +'/'
  });

  server.route({
    method: 'GET',
    path: '/',             // other routes are added by the plugins
    handler: login_handler // display login/registration form
  });

});

server.start(function() {
  console.log('Visit: http://127.0.0.1:'+server.info.port);
});

module.exports = server;
