const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Academic' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], default: 'PENDING' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);