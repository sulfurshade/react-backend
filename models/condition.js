const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  urgency: { type: String, required: true },
  date: { type: Date, required: true }
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

const Condition = mongoose.model('Condition', schema);

module.exports = Condition;
