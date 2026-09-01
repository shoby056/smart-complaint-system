const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/authMiddleware');

// Get Complaints (Admin sees all, User sees personal)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'ADMIN') {
      const complaints = await Complaint.find().populate('user', 'name email');
      return res.json(complaints);
    }
    const userComplaints = await Complaint.find({ user: req.user._id });
    res.json(userComplaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Complaint
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description,
      category: category || 'Academic',
      priority: priority || 'Medium'
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// EDIT Complaint (User can edit their own complaint)
router.put('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    complaint.title = req.body.title || complaint.title;
    complaint.description = req.body.description || complaint.description;
    complaint.category = req.body.category || complaint.category;
    complaint.priority = req.body.priority || complaint.priority;

    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE Complaint (User or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Complaint Status (Admin Only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;