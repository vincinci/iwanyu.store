import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Define vendor info interface
interface VendorInfo {
  storeName: string;
  description: string;
  phoneNumber: string;
  address: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  subscriptionPlan?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  transactionReference?: string;
  transactionId?: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor' | 'admin';
  vendorInfo?: VendorInfo;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  vendorInfo: {
    storeName: String,
    description: String,
    phoneNumber: String,
    address: String,
    category: String,
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    subscriptionPlan: String,
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    transactionReference: String,
    transactionId: String
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
