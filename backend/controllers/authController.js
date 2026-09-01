const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register User (Default Status: PENDING)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'USER',
      status: 'PENDING',
    });

    res.status(201).json({
      message: 'Account Created successfully. Wait for Admin Approval.',
      user: { id: user._id, name: user.name, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Single Common Login Page Handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    // Diagram Flow: Check Account Status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'ACCESS DENIED: Account is PENDING or DEACTIVATED. Wait for admin approval.' 
      });
    }

    // Token with Role detection
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};