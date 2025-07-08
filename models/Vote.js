const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  election_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voted_at: { type: Date, default: Date.now }
});

// Prevent duplicate vote for same election
voteSchema.index({ user_id: 1, election_id: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
