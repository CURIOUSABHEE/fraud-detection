import mongoose from 'mongoose';

// MPIN is stored as a bcrypt hash — raw validation happens in the route handler
const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    full_name: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    pan_card: { type: String, required: false, trim: true },
    balance: { type: Number, default: 50000 },
    mpin: { type: String, required: true },          // stored as bcrypt hash
    totpSecret: { type: String },
    is2FAEnabled: { type: Boolean, default: false },
    latest_login: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
