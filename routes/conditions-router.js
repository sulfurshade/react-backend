var express = require('express');
const bodyParser = require('body-parser');

const Condition = require('../models/condition');
var router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', (req, res) => {
  const requiredFields = ['name', 'description', 'urgency', 'date'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Condition
    .create({
      name: req.body.name,
      description: req.body.description,
      urgency: req.body.urgency,
      date: req.body.date
    })
    .then(condition => res.status(201).json(condition.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});

router.get('/', (req, res) => {
  Condition.find()
    .then(conditions => res.json(conditions.map(condition => condition.apiRepr())))
    .catch(err => res.status(500).json({ error: true, reason: err }))
});

router.get('/:id', (req, res) => {
  Condition.findById(req.params.id)
    .then(condition => res.json(condition.apiRepr()))
    .catch(err => res.status(500).json({error: true, reason: JSON.stringify(err) }))
})

router.delete('/:id', (req, res) => {
  Condition
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
  const updateableFields = ['name', 'description', 'urgency', 'date'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Condition
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = {conditionsRouter:router};
