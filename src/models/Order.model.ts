import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
}

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  totalPrice: { type: Number, required: true },
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
