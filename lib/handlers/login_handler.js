var help = require('../helpers');
var bcrypt = require('bcrypt');    // https://github.com/nelsonic/bcrypt

/**
 * register_handler is a dual-purpose handler that initially renders
 * the registration form but is re-used to display the form with any
 * Joi validation errors to the client until they input valid data!
 * @param {Object} request - the hapi request object
 * @param {Object} reply - the standard hapi reply object
 * @param {String} source - source of the invalid field e.g: 'payload'
 * @param {Object} error - the error object prepared for the client
 * response (including the validation function error under error.data
 */
function login_handler(request, reply, source, error) {
  // show the registration form until its submitted correctly
  if(!request.payload || request.payload && error) {
    var errors, values; // return empty if not set.
    if(error && error.data) { // means the handler is dual-purpose
      errors = help.extract_validation_error(error); // the error field + message
      values = help.return_form_input_values(error); // avoid wiping form data
    }
    return reply.view('index', {
      title  : 'Please Register ' + request.server.version,
      error  : errors, // error object used in html template
      values : values  // (escaped) values displayed in form inputs
    }).code(error ? 400 : 200);
  }
  else { // no errors and the payload has valid email, lets look it up in DB:
    var select = 'SELECT * FROM people WHERE (email = $1)';
    // console.log('select: ', select);
    request.pg.client.query(select, [ request.payload.email ], function(err, result) {
      // console.log(err, result);
      if (!err && result.rowCount === 1) { // email exists, lets check password
        // console.log(result);
        var pw = request.payload.password;
        var hash = result.rows[0].password;
        bcrypt.compare(pw, hash, function(err, res) { // check password match
            console.log(err, res);
            if(!err && res === true) { // no error and password matches
              reply.view('admin', {
                name  : result.rows[0].name || 'Friend',
                email : help.escape(request.payload.email)
              });
            }
            else {
              reply.view('index', {
                title: 'Login Failed: Email Address or Password incorrect',
                error  : { error: { email: {
                  message: 'Sorry, email address or password is incorrect'}
                }}, // yes, this is a deeply nested error object, extracted in view
                values : { email: help.escape(request.payload.email) }
              }).code(401);
            }
        });
      }
      else { // email did not exist in the database so we reply accordingly
        reply.view('index', {
          title: 'Email Address not Registered, Please Register!',
          error  : { error: { email: {
            message: 'Sorry, that email address is not registered.'}
          }}, // yes, this is a deeply nested error object, extracted in view
          values : { email: help.escape(request.payload.email) }
        }).code(401);
      }
      return; // always return
    }); // END request.pg.client.query
  }
}

module.exports = login_handler;
