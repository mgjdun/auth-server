const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
  // "sub: user.id" means: subject of this token is this specific user
  // "iat: timestamp" means: issued at time: timestamp
}

exports.signin = function(req, res, next) {
  // User has already had their email & password auth'd, we just need to give them a token
  // passport assigned the user model to req.user (see /services/passport.js)
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  } else if (!validateEmail(email)) {
    return res.status(422).send({ error: 'Email is not valid' });
  }

  // See if a user with the given email exists
  User.findOne( { email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // If a user with email does exist, return an error
    // (422 = unprocessable entity)
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) { return next(err); }

      // Respond to request indicating the user was created
      res.json({ token: tokenForUser(user) });
    });
  });
}
