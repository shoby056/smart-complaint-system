const User = require('../models/User');
const Complaint = require('../models/Complaint');

// ⚠️ ZAROORI: Yahan APNI EMAIL ID likhein (Jiss account se aap login hote hain)
// Misal ke taur par: "myemail@gmail.com"
const SUPER_ADMIN_EMAIL = "admin@system.com"; 

// 1. Fetch ALL Registered Users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Approve / Reject / Change Account Status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'DEACTIVATED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    res.status(200).json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Manage User Roles (SUPER ADMIN PROTECTED)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value.' });
    }

    // Database se target user dhoondhein
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔒 ABSOLUTE BLOCK: Target user ki email compare karein (Case Insensitive)
    const isSuperAdminAccount = targetUser.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();

    // Agar target user Super Admin hai AUR role 'USER' karne ki koshish ki ja rahi hai -> BLOCK IT!
    if (isSuperAdminAccount && role === 'USER') {
      return res.status(403).json({ 
        message: 'Aap Super Admin ko USER nahi bana sakte! Access Denied.' 
      });
    }

    // Direct Database Save with strict check
    targetUser.role = role;
    await targetUser.save();

    const updatedUser = targetUser.toObject();
    delete updatedUser.password;

    res.status(200).json({ message: `User role updated to ${role}`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Permanently Remove User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔒 Super Admin deletion block
    if (user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim()) {
      return res.status(403).json({ message: 'Super Admin ka account delete nahi ho sakta!' });
    }

    await Complaint.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User and all associated complaints deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};