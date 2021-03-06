const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
const config = require('../config');

const Doctor = require('../models/doctor');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const router = express.Router();

var opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.JWT_SECRET;

router.post('/login', (req, res) => {
        console.log("received request");
        console.log(req.body.username);

        Doctor.findOne({username: req.body.username}, function(err, user) {
            if (err) {
                console.log("There was an error", err);
                //return done(err, false);
            }

            if (user) {
                console.log("There was no error. We found the user!", user);

                if (user.validPassword(req.body.password)) {
                    console.log("password is valid", user.apiRepr());

                    const token = jwt.sign(user.apiRepr(), config.JWT_SECRET);
                    return res.json({user, token});

                } else  {
                    console.log("password is invalid");
                    return res.status(401).send({ message: "Invalid credentials"});
                }


            } else {
                return res.status(401).send({ message: "Invalid credentials"});
            }
        });
});

router.post(
    '/refresh',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        const token = createAuthToken(req.user);
        res.json({authToken});
    }
);

router.post(
  '/refresh2',
  (req, res) => {
    // console.log('hello from refresh2');
    if (!req.headers.authorization) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    jwt.verify(token, config.JWT_SECRET, function(err, decodedUser){
      if (err) {
        console.log('there was an error', err);
        return res.status(401).send({ message: "Invalid credentials" });
      }
      else {
        console.log('user verified successfully');
        const token = createAuthToken(decodedUser);
        res.json({token});
      }
    });
  }
);

module.exports = router;

// localStorage.setItem('token', data.authToken);
