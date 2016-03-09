var help = require('./helpers');
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
  else { // once successful, show welcome message!
    return reply.view('success', {
      name   : 'Friend',
      email  : help.validator.escape(request.payload.email)
    })
  }
}

module.exports = login_handler;
