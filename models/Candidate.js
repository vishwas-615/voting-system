const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true,unique: true },
  bio: { type: String },
  election_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
