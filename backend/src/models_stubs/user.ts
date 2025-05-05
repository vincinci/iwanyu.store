// This is a stub file for compatibility with existing imports
// The application has been migrated from MongoDB to Neon PostgreSQL with Drizzle ORM

// Define interfaces for type compatibility
export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create a stub model that mimics the Mongoose interface
const User = {
  find: () => ({
    limit: () => ({
      skip: () => ({
        sort: () => Promise.resolve([])
      })
    })
  }),
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null),
  countDocuments: () => Promise.resolve(0),
  create: () => Promise.resolve({}),
  updateOne: () => Promise.resolve({ acknowledged: true, modifiedCount: 1 })
};

// Export the stub model
export default User;
