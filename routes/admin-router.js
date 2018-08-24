const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Admin } = require('../models/admin');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const authorizeUser = require('./authorize-user');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

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
      Admin.findOne({ email }, function(err, user) {
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
  Admin.findById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/', authorizeUser, (req, res) => {
  const requiredFields = ['name', 'encryptedPassword', 'email'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Admin
    .create({
      name: req.body.name,
      encryptedPassword: req.body.encryptedPassword,
      email: req.body.email
    })
    .then(admin => res.status(201).json(admin.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});

router.get('/', authorizeUser, (req, res) => {
  Admin.find()
    .then(admins => res.json(admins.map(admin => admin.apiRepr())))
    .catch(err => res.status(500).json({ error: true, reason: err }))
});

router.get('/:id', authorizeUser, (req, res) => {
  Admin.findById(req.params.id)
    .then(admin => res.json(admin.apiRepr()))
    .catch(err => res.status(500).json({error: true, reason: JSON.stringify(err) }))
})

router.delete('/:id', authorizeUser, (req, res) => {
  Admin
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
  const updateableFields = ['name', 'encryptedPassword', 'email'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Admin
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = router;
