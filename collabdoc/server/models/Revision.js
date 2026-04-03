const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String
  },
  snapshot: {
    type: Buffer
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Revision', revisionSchema);
