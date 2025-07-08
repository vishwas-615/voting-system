const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true ,unique: true},
  description: { type: String },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
