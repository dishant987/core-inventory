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
     
     const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
     user.otp = resetToken;
     user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
     await user.save();

     // Enhanced HTML Email Template
     const emailHtml = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
         <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
           <h1 style="color: white; margin: 0; font-size: 24px;">CoreInventory</h1>
         </div>
         <div style="padding: 30px; background-color: #ffffff;">
           <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
           <p style="color: #475569; font-size: 16px; line-height: 1.5;">
             Hello,<br><br>
             We received a request to reset your password. Please use the 6-digit OTP code below to securely change your password.
           </p>
           <div style="text-align: center; margin: 30px 0;">
             <span style="display: inline-block; background-color: #f1f5f9; border: 1px dashed #cbd5e1; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px;">
               ${resetToken}
             </span>
           </div>
           <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
             This code is valid for <strong>10 minutes</strong>. If you did not request this, please safely ignore this email.
           </p>
         </div>
       </div>
     `;

     await sendEmail({
       email: user.email,
       subject: 'CoreInventory - Your Password Reset OTP',
       message: `Your 6-digit OTP is: ${resetToken}.\nThis OTP will expire in 10 minutes.`,
       html: emailHtml
     });

     res.status(200).json({ message: '6-digit OTP sent to your email.' });
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

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({
      otp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
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

