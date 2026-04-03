const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled'
  },
  shareCode: {
    type: String,
    unique: true,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  ydocState: {
    type: Buffer,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
