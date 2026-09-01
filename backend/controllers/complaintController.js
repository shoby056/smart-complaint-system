const Complaint = require('../models/Complaint');

// Submit Complaint (User)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      user: req.user._id,
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Tracks Status (Get Own Complaints)
exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin View All Complaints + Search & Filter
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query).populate('user', 'name email');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Review & Update Status (IN_PROGRESS / RESOLVED / REJECTED)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};