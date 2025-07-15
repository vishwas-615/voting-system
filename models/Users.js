// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password_hash: {
    type: String,
    required: true
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
