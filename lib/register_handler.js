var pg = require('pg');
var Boom = require('boom');
var bcrypt = require('bcrypt');    // https://github.com/nelsonic/bcrypt
var escape = require('pg-escape'); // https://github.com/segmentio/pg-escape

module.exports = function register_handler(request, reply) {
  // console.log(request.method);
  if (request.method === 'get') { // get does not send payload so return reg page
    return reply.view('index').code(200);
  }
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    console.log(err);
    // first drop any tables you had before so we have a clean database:
    // see: http://stackoverflow.com/a/13823560/1148249
    var select = escape('SELECT * FROM people WHERE email = %I', request.payload.email);
    console.log('select: ', select);
    client.query(query, function(err, result) {
      console.log(err, result);
      done();       // call `done()` to release the client back to the pool
      client.end(); // close connection to database
      // return callback(err, result);
      return reply('Success');
    });
  });

  // redisClient.get(request.payload.email, function (err, reply) {
  //   if(err) { // error when if not already registered, register the person:
  //     bcrypt.genSalt(12, function(err, salt) {
  //       bcrypt.hash(req.payload.password, salt, function(err, hash) {
  //         request.payload.password = hash; // save the password's hash
  //         redisClient.set(request.payload.email, JSON.stringify(request.payload));
  //         return reply('Success')
  //       }); // end bcrypt.hash
  //     }); // end bcrypt.genSalt
  //   }
  //   else {
  //     return reply(Boom.badRequest('Already Registered'));
  //   }
  // });
}
