import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
}

const cartSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
