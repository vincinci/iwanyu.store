import { pgTable, serial, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  vendorInfo: jsonb('vendor_info')
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // Store price in cents
  images: jsonb('images'), // Array of image URLs
  category: text('category').notNull(),
  vendorId: uuid('vendor_id').references(() => users.id),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  paymentMethod: text('payment_method').notNull(),
  itemsPrice: integer('items_price').notNull(), // Store price in cents
  shippingPrice: integer('shipping_price').notNull(), // Store price in cents
  taxPrice: integer('tax_price').notNull(), // Store price in cents
  totalPrice: integer('total_price').notNull(), // Store price in cents
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: timestamp('paid_at'),
  isDelivered: boolean('is_delivered').notNull().default(false),
  deliveredAt: timestamp('delivered_at'),
  transactionReference: text('transaction_reference'),
  paymentResult: jsonb('payment_result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(), // Store price in cents
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Subscription plans table
export const subscriptionPlans = pgTable('subscription_plans', {
  id: text('id').primaryKey(), // e.g., 'basic', 'premium', 'enterprise'
  name: text('name').notNull(),
  price: integer('price').notNull(), // Store price in cents
  features: jsonb('features').notNull(), // Array of features
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
