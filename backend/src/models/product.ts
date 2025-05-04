import mongoose, { Document, Schema } from 'mongoose';

interface Rating {
  userId: mongoose.Types.ObjectId;
  rating: number;
  review: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendor: mongoose.Types.ObjectId;
  stock: number;
  ratings: Rating[];
  averageRating: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  category: { type: String, required: true },
  vendor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  stock: { type: Number, required: true, default: 0 },
  ratings: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true },
      review: { type: String }
    }
  ],
  averageRating: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);
