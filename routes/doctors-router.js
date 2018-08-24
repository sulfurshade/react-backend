const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Doctor = require('../models/doctor');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const config = require('../config');
const jwt = require('jsonwebtoken');
const authorizeUser = require('./authorize-user');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

function ensureDoctor(req, res, next) {
  // console.log("ensureDoctor", req.headers);
  const token = req.headers["authorization"];
  console.log(token);
  // if (req.user) {
  if (token === "Bearer Joey") {
    console.log('Ensure Doctor If');
    return next();
  }
  else {
    console.log('ensure doctor else');
    return res.send(401);
  }
};

const options = {
  secretOrKey: config.JWT_SECRET,
  usernameField: "email",
  passReqToCallback: true,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
 };
passport.use(
  new JWTStrategy(
    options,
    function(req, email, password, done) {
      Doctor.findOne({ email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password."
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect username or password."
          });
        }
        return done(null, user);
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);;
})

passport.deserializeUser(function(id, done) {
  Doctor.findById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/', authorizeUser, (req, res) => {
  const requiredFields = ['name', 'number', 'practice'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Doctor
    .create({
      name: req.body.name,
      number: req.body.number,
      practice: req.body.practice,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(doctor => res.status(201).json(doctor.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});

router.get('/', authorizeUser, (req, res) => {
  console.log('inside doctor get');
  Doctor.find()
    .then(doctors => res.json(doctors.map(doctor => doctor.apiRepr())))
    .catch(err => res.status(500).json({ error: true, reason: err }))
});

router.get('/:id', authorizeUser, (req, res) => {
  Doctor.findById(req.params.id)
    .then(doctor => res.json(doctor.apiRepr()))
    .catch(err => res.status(500).json({error: true, reason: JSON.stringify(err) }))
})

router.delete('/:id', authorizeUser, (req, res) => {
  Doctor
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.put('/:id', authorizeUser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['name', 'number', 'practice'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Doctor
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = router;
