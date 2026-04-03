const express = require('express');
const Document = require('../models/Document');
const Revision = require('../models/Revision');

const router = express.Router();

// Helper: generate 6-char alphanumeric share code
function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/docs — list all docs the user owns or collaborates on
router.get('/', async (req, res) => {
  try {
    const docs = await Document.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    })
      .populate('owner', 'name')
      .sort({ updatedAt: -1 });

    return res.json(docs);
  } catch (err) {
    console.error('List docs error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/docs — create a new document
router.post('/', async (req, res) => {
  try {
    let shareCode = generateShareCode();

    // Ensure uniqueness of shareCode
    while (await Document.findOne({ shareCode })) {
      shareCode = generateShareCode();
    }

    const doc = await Document.create({
      title: req.body.title || 'Untitled',
      shareCode,
      owner: req.user._id
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('Create doc error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/docs/:id — get a single document
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Verify ownership or collaborator
    const isOwner = doc.owner.toString() === req.user._id.toString();
    const isCollaborator = doc.collaborators.some(
      (c) => c.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(doc);
  } catch (err) {
    console.error('Get doc error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/docs/:id/title — update document title
router.patch('/:id/title', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Verify ownership or collaborator
    const isOwner = doc.owner.toString() === req.user._id.toString();
    const isCollaborator = doc.collaborators.some(
      (c) => c.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    doc.title = req.body.title || doc.title;
    doc.updatedAt = new Date();
    await doc.save();

    return res.json(doc);
  } catch (err) {
    console.error('Update title error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/docs/:id — delete document (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this document' });
    }

    // Delete all revisions for this document
    await Revision.deleteMany({ docId: doc._id });

    // Delete the document itself
    await Document.findByIdAndDelete(doc._id);

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete doc error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/docs/join — join a document via share code
router.post('/join', async (req, res) => {
  try {
    const { shareCode } = req.body;

    if (!shareCode) {
      return res.status(400).json({ message: 'Share code is required' });
    }

    // Case-insensitive search
    const doc = await Document.findOne({
      shareCode: shareCode.toUpperCase()
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found with that share code' });
    }

    // Add user as collaborator if not already present
    const alreadyCollaborator = doc.collaborators.some(
      (c) => c.toString() === req.user._id.toString()
    );
    const isOwner = doc.owner.toString() === req.user._id.toString();

    if (!alreadyCollaborator && !isOwner) {
      doc.collaborators.push(req.user._id);
      await doc.save();
    }

    return res.json(doc);
  } catch (err) {
    console.error('Join doc error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/docs/:id/revisions — get revision history
router.get('/:id/revisions', async (req, res) => {
  try {
    const revisions = await Revision.find({ docId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(20);

    return res.json(revisions);
  } catch (err) {
    console.error('Get revisions error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
