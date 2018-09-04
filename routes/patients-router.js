const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Patient = require('../models/patient');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const authorizeUser = require('./authorize-user');
const bcrypt = require('bcrypt');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

function ensurePatient(req, res, next) {
  const token = req.headers["authorization"];
  console.log(token);
  if (token === "Bearer Joey") {
    return next();
  }
  else {
    return res.send(401);
  }
};

const options = {
  secretOrKey: 'tempvalue',
  usernameField: "email",
  passReqToCallback: true,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
 };

passport.use(
  new JWTStrategy(
    options,
    function(req, email, password, done) {
      Patient.findOne({ email }, function(err, user) {
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
  Patient.findById(id, function(err, user) {
    done(err, user);
  });
});

router.get('/', authorizeUser, (req, res) => {
  Patient
    .find()
    .then(patients => {
      res.json(patients.map(patient => patient.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.get('/:id', authorizeUser, (req, res) => {
  Patient
    .findOne({id: req.params.id})
    .then(patient => res.json(patient.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['name', 'number', 'age', 'gender', 'password', 'username'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 15);

  Patient
    .create({
      name: req.body.name,
      number: req.body.number,
      age: req.body.age,
      gender: req.body.gender,
      password: hashedPassword,
      username: req.body.username
    })
    .then(patient => res.status(201).json(patient.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});


router.delete('/:id', authorizeUser, (req, res) => {
  Patient
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
  const updateableFields = ['name', 'number', 'age', 'gender'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Patient
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});


module.exports = router;
