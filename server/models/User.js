import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    loginId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [6, 'Login ID must be at least 6 characters'],
      maxlength: [12, 'Login ID must be at most 12 characters'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [9, 'Password must be more than 8 characters'],
      validate: {
        validator: function (v) {
          // must contain a small case, a large case and a special character
          return /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}/.test(v);
        },
        message: 'Password must contain a lowercase letter, an uppercase letter, and a special character.',
      },
    },
    role: {
      type: String,
      enum: ['Admin', 'Inventory Manager', 'Warehouse Staff'],
      default: 'Admin',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const User = mongoose.model('User', userSchema);

export default User;
