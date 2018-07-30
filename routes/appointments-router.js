var express = require('express');
const bodyParser = require('body-parser');

const Appointment = require('../models/appointment');
var router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', (req, res) => {
  const requiredFields = ['date', 'patient', 'doctor', 'reason'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Appointment
    .create({
      date: req.body.date,
      patient: req.body.patient,
      doctor: req.body.doctor,
      reason: req.body.reason
    })
    .then(appointment => res.status(201).json(appointment.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});

router.get('/', (req, res) => {
  Appointment.find()
    .then(appointments => res.json(appointments.map(appointment => appointment.apiRepr())))
    .catch(err => res.status(500).json({ error: true, reason: err }))
});

router.get('/:id', (req, res) => {
  Appointment.findById(req.params.id)
    .then(appointment => res.json(appointment.apiRepr()))
    .catch(err => res.status(500).json({error: true, reason: JSON.stringify(err) }))
})

router.delete('/:id', (req, res) => {
  Appointment
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
  const updateableFields = ['date', 'patient', 'doctor', 'reason'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Appointment
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = router;
