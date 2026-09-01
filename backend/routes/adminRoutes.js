const express = require('express');
const router = express.Router();
const { 
  getPendingUsers, 
  updateUserStatus, 
  updateUserRole, 
  deleteUser // Added deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/pending-users', protect, adminOnly, getPendingUsers);
router.put('/users/:userId/status', protect, adminOnly, updateUserStatus);
router.put('/users/:userId/role', protect, adminOnly, updateUserRole);

// DELETE Route: User & Cascade Complaints Removal
router.delete('/users/:userId', protect, adminOnly, deleteUser);

module.exports = router;