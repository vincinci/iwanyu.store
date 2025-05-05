// This is a stub file for compatibility with existing imports
// The application has been migrated from MongoDB to Neon PostgreSQL with Drizzle ORM

// Create a stub model that mimics the Mongoose interface
const Product = {
  find: () => ({
    populate: () => ({
      limit: () => ({
        skip: () => ({
          sort: () => Promise.resolve([])
        })
      })
    })
  }),
  findById: () => ({
    populate: () => Promise.resolve(null)
  }),
  countDocuments: () => Promise.resolve(0),
  deleteOne: () => Promise.resolve({ acknowledged: true, deletedCount: 1 })
};

// Export the stub model
export default Product;
