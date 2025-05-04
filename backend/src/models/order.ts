import mongoose, { Document, Schema } from 'mongoose';

// Order Item Schema
interface OrderItem {
  product: mongoose.Types.ObjectId;
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
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
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

// Order Schema
const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  transactionReference: {
    type: String
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
