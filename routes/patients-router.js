var express = require('express');
const bodyParser = require('body-parser');

const Patient = require('../models/patient');
var router = express.Router();

const jsonParser = bodyParser.json();

router.get('/', (req, res) => {
  Patient
    .find()
    .then(patients => {
      res.json(patients.map(student => patient.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.get('/:id', (req, res) => {
  Patient
    .findOne({id: req.params.id})
    .then(patient => res.json(patient.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['name', 'number', 'age', 'gender'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Patient
    .create({
      name: req.body.name,
      number: req.body.number,
      age: req.body.age,
      gender: req.body.gender
    })
    .then(patient => res.status(201).json(patient.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});


router.delete('/:id', (req, res) => {
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


router.put('/:id', (req, res) => {
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


module.exports = {patientsRouter:router};
