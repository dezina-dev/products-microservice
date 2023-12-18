import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  image: string;
  description: string;
  price: number;
}

const productSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
