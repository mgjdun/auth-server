const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// -----------------------------------------------------------------------------
// Create local strategy
// -----------------------------------------------------------------------------
const localOptions = { usernameField: 'email' }; // to use email instead of username
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify this email and password, call 'done' with the user if it is the
  // correct email and password. Otherwise, call done with false
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    // compare passwords - is 'password' equal to user.password?
    user.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false); }

      return done(null, user); // the user model is assigned to req.user
    });
  });
});

// -----------------------------------------------------------------------------
// Create JWT Strategy
// -----------------------------------------------------------------------------

// Setup options for JWT (JSON Web Token) Strategy
const jwtOptions = {
  // Look for the token in the header, specifically a header called 'authorization'
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the user ID in the payload exists in our database.
  // (payload = the decoded JWT token (user ID + timestamp))
  User.findById(payload.sub, function(err, user) {
    if (err) { return done(err, false); }

    if (user) {
      //If it does, call 'done' with that user.
      done(null, user);
    } else {
      // Otherwise, call 'done' without a user object.
      done(null, false);
    }
  })
});

// -----------------------------------------------------------------------------
// Tell passport to use this strategy
// -----------------------------------------------------------------------------
passport.use(jwtLogin);
passport.use(localLogin);
