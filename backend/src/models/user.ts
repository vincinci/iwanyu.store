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
  save(): Promise<IUser>;
}

// Create a stub model that mimics the Mongoose interface
const userObj = {
  _id: 'user-id-123',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'customer' as const,
  comparePassword: async (candidatePassword: string) => {
    return bcrypt.compare(candidatePassword, 'hashed_password');
  },
  save: async () => userObj
};

const User = {
  find: () => ({
    select: () => Promise.resolve([userObj]),
    limit: () => ({
      skip: () => ({
        sort: () => Promise.resolve([userObj])
      })
    })
  }),
  findById: (id: string) => ({
    select: () => Promise.resolve({...userObj, _id: id}),
    exec: () => Promise.resolve({...userObj, _id: id})
  }),
  findOne: (query: any) => ({
    select: () => Promise.resolve({...userObj, ...query}),
    exec: () => Promise.resolve({...userObj, ...query})
  }),
  countDocuments: () => Promise.resolve(1),
  create: (data: any) => Promise.resolve({...userObj, ...data}),
  updateOne: () => Promise.resolve({ acknowledged: true, modifiedCount: 1 })
};

export default User;
