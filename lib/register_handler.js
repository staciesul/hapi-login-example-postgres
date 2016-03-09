var pg = require('pg');
var Boom = require('boom');
var bcrypt = require('bcrypt');    // https://github.com/nelsonic/bcrypt
var escape = require('pg-escape'); // https://github.com/segmentio/pg-escape
var help = require('./helpers');
var Hoek = require('hoek');

module.exports = function register_handler(request, reply, source, error) {
  // console.log(request.method);
  if (request.method === 'get') { // get does not send payload so return reg
    return reply.view('index', { title : 'Please Register' }).code(200);
  }
  if(!request.payload || request.payload && error) { // *any* validation errors
    var errors, values; // return empty if not set.
    if(error && error.data) { // means the handler is dual-purpose
      errors = help.extract_validation_error(error); // error field & message
      values = help.return_form_input_values(error); // avoid wiping form data
    }
    return reply.view('index', {
      title  : 'Please Register ' + request.server.version,
      error  : errors, // error object used in html template
      values : values  // (escaped) values displayed in form inputs
    }).code(400);
  } // this block is essentially doing *manual* Joi validation to show html!
  else { // the payload was valid, lets see if the person has already registered
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      var select = escape('SELECT * FROM people WHERE (email = %L)',
        request.payload.email); // http://stackoverflow.com/a/13823560/1148249
      console.log('select: ', select);
      client.query(select, function(err, result) {
        if (err || result.rowCount === 0) { // user does not exist register!
          bcrypt.genSalt(12, function(err, salt) {  // encrypt the password:
            bcrypt.hash(request.payload.password, salt, function(err, hash) {
              var q = 'INSERT INTO %s (email, password) VALUES (%L, %L)';
              var insert = escape(q, 'people', request.payload.email, hash);
              console.log('insert: ', insert);
              client.query(insert, function(err, result) {
                // at this point we should not be getting an error...
                Hoek.assert(!err, 'ERROR: inserting data into Postgres');
                done();       // call `done()` to release the client
                client.end(); // close connection to database
                return reply.view('success', {
                  name   : 'Friend',
                  email  : help.validator.escape(request.payload.email)
                })
              });
            }); // end bcrypt.hash
          }); // end bcrypt.genSalt
        } else { // if there is no error SELECTING the User, it Exists!!
          console.log(err, result);
          done();       // call `done()` to release the client back to the pool
          client.end(); // close connection to database
          return reply.view('index', {
            title: 'Sorry, Please try a different email address!',
            error  : { error: { email: {
              message: 'That email address has already been registered.'}
            }}, // yes, this is a deeply nested error object
            values : {  // keep form data
              email: help.validator.escape(request.payload.email)
            }
          }).code(400);
        }
      });
    });
  }
}
