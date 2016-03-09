var pg = require('pg');
var Boom = require('boom');
var bcrypt = require('bcrypt');    // https://github.com/nelsonic/bcrypt
var escape = require('pg-escape'); // https://github.com/segmentio/pg-escape
var help = require('./helpers');
var Hoek = require('hoek');

module.exports = function register_handler(request, reply, source, error) {
  // console.log(request.method);
  if (request.method === 'get') { // get does not send payload so return reg page
    return reply.view('index', {
      title  : 'Please Register ' + request.server.version
    }).code(200);
  }
  // if there was a lack of a payload or *any* error in validation
  if(!request.payload || request.payload && error) {
    var errors, values; // return empty if not set.
    if(error && error.data) { // means the handler is dual-purpose
      errors = help.extract_validation_error(error); // error field & message
      values = help.return_form_input_values(error); // avoid wiping form data
    }
    return reply.view('index', {
      title  : 'Please Register ' + request.server.version,
      error  : errors, // error object used in html template
      values : values  // (escaped) values displayed in form inputs
    }).code(error ? 400 : 200);
  } // this block is essentially doing *manual* Joi validation to show html!
  else { // the payload was valid, lets see if the person has already registered
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      console.log(err);
      // first drop any tables you had before so we have a clean database:
      // see: http://stackoverflow.com/a/13823560/1148249
      var select = escape('SELECT * FROM people WHERE (email = %I)',
        request.payload.email);
      console.log('select: ', select);
      client.query(select, function(err, result) {
        if (err) { // user does not yet exist, register them!
          bcrypt.genSalt(12, function(err, salt) {  // encrypt the password:
            bcrypt.hash(request.payload.password, salt, function(err, hash) {
              var q = 'INSERT INTO %s (email, password) VALUES (%I, %I)';
              var insert = escape(q, 'people', request.payload.email, hash);
              console.log('insert: ', insert);
              client.query(insert, function(err, result) {
                // at this point we should not be getting an error...
                console.log(' - - - - - - - - - - - - - - - - - ');
                console.log(err);
                Hoek.assert(!err, 'ERROR: inserting data into Postgres');
                done();       // call `done()` to release the client back to the pool
                client.end(); // close connection to database
                return reply.view('success', {
                  name   : 'Friend',
                  email  : help.validator.escape(request.payload.email)
                })
              });
            }); // end bcrypt.hash
          }); // end bcrypt.genSalt
        } else {
          done();       // call `done()` to release the client back to the pool
          client.end(); // close connection to database
          return reply.view('success', {
            name   : 'Friend',
            email  : help.validator.escape(request.payload.email)
          })
        }
      });
    });
  }
}
