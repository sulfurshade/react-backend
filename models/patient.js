const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  age: { type: Number, required: true},
  gender: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true }
});

schema.methods.apiRepr = () => {
  const repr = { id: this._id };
  Object.keys(this).forEach(key => {
    if (key !== '_id') {
      Object.assign(repr, { [key]: this[key] });
    }
  });
  return repr;
}

const Patient = mongoose.model('Patient', schema, 'Patient');

module.exports = Patient;
