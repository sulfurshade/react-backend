var express = require('express');
const bodyParser = require('body-parser');

const Doctor = require('../models/doctor');
var router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', (req, res) => {
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

router.get('/', (req, res) => {
  Doctor.find()
    .then(doctors => res.json(doctors.map(doctor => doctor.apiRepr())))
    .catch(err => res.status(500).json({ error: true, reason: err }))
});

router.get('/:id', (req, res) => {
  Doctor.findById(req.params.id)
    .then(doctor => res.json(doctor.apiRepr()))
    .catch(err => res.status(500).json({error: true, reason: JSON.stringify(err) }))
})

router.delete('/:id', (req, res) => {
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

router.put('/:id', (req, res) => {
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
