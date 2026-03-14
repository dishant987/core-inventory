import { User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export const signup = async (req, res) => {
  try {
    const { loginId, name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ 
      $or: [{ email }, { loginId }] 
    });

    if (userExists) {
      if (userExists.email === email) {
         return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(400).json({ message: 'Login ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      loginId,
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        loginId: user.loginId,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    const user = await User.findOne({ loginId });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        loginId: user.loginId,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid loginId or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
     const { email } = req.body;
     const user = await User.findOne({ email });

     if (!user) {
         return res.status(404).json({ message: 'No user found with that email address' });
     }
     
     const resetToken = crypto.randomBytes(20).toString('hex');
     user.otp = resetToken;
     user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
     await user.save();

     await sendEmail({
       email: user.email,
       subject: 'Password Reset Token',
       message: `Your reset token is: ${resetToken}.\nThis token will expire in 10 minutes.`,
     });

     res.status(200).json({ message: 'Password reset link sent to email.', otp: resetToken });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      otp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear the OTP fields
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  // Since we are using JSON Web Tokens (JWT) typically stored in localStorage
  // on the frontend, actual "logout" is simply returning a 200 OK 
  // and having the frontend drop the token.
  res.status(200).json({ message: 'Logged out successfully' });
};

