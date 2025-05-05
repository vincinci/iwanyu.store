// This is a stub file for compatibility with existing imports
// The application has been migrated from MongoDB to Neon PostgreSQL with Drizzle ORM

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

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor' | 'admin';
  vendorInfo?: VendorInfo;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create a stub model that mimics the Mongoose interface
const userMethods = {
  comparePassword: async (candidatePassword: string) => {
    return bcrypt.compare(candidatePassword, 'hashed_password');
  }
};

const User = {
  find: () => ({
    limit: () => ({
      skip: () => ({
        sort: () => Promise.resolve([])
      })
    })
  }),
  findById: () => Promise.resolve({ ...userMethods }),
  findOne: () => Promise.resolve({ ...userMethods }),
  countDocuments: () => Promise.resolve(0),
  create: () => Promise.resolve({ ...userMethods }),
  updateOne: () => Promise.resolve({ acknowledged: true, modifiedCount: 1 })
};

export default User;
