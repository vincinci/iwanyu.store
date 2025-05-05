// This is a stub file for compatibility with existing imports
// The application has been migrated from MongoDB to Neon PostgreSQL with Drizzle ORM

// Define interfaces for type compatibility
interface OrderItem {
  product: any;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

// Shipping Address Schema
interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Payment Result Schema
interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

// Order Interface
export interface IOrder {
  _id: string;
  user: any;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  transactionReference?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a stub model that mimics the Mongoose interface
const Order = {
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
  findOne: () => ({
    populate: () => Promise.resolve(null)
  }),
  countDocuments: () => Promise.resolve(0),
  create: () => Promise.resolve({}),
  updateOne: () => Promise.resolve({ acknowledged: true, modifiedCount: 1 })
};

export default Order;
