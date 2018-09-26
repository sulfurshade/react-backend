const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  urgency: { type: String, required: true },
  date: { type: Date, required: true }
});

schema.methods.apiRepr = function () {
  const obj = this.toObject();
  const payload = {
    name: this.name,
    description: this.description,
    urgency: this.urgency,
    date: this.date
  };
  return payload;
}

const Condition = mongoose.model('Condition', schema, 'Condition');

module.exports = Condition;
