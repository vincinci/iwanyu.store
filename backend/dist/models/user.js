"use strict";
// This is a stub file for compatibility with existing imports
// The application has been migrated from MongoDB to Neon PostgreSQL with Drizzle ORM
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// Create a stub model that mimics the Mongoose interface
const userObj = {
    _id: 'user-id-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'customer',
    comparePassword: async (candidatePassword) => {
        return bcrypt_1.default.compare(candidatePassword, 'hashed_password');
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
    findById: (id) => ({
        select: () => Promise.resolve({ ...userObj, _id: id }),
        exec: () => Promise.resolve({ ...userObj, _id: id })
    }),
    findOne: (query) => ({
        select: () => Promise.resolve({ ...userObj, ...query }),
        exec: () => Promise.resolve({ ...userObj, ...query })
    }),
    countDocuments: () => Promise.resolve(1),
    create: (data) => Promise.resolve({ ...userObj, ...data }),
    updateOne: () => Promise.resolve({ acknowledged: true, modifiedCount: 1 })
};
exports.default = User;
