import { Request, Response } from 'express';
import Order, { IOrderItem } from '../models/Order.model';
import mongoose from 'mongoose';
import Cart from '../models/Cart.model';
require("dotenv").config();

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);

const geOrders = async (req: Request, res: Response) => {
  try {
    const payments = await Order.find();
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const myorders = await Order.findById(userId);

    if (!myorders) {
      return res.status(404).json({ message: 'Orders not found' });
    }

    res.json(myorders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {

    const { userId, items, totalPrice, cartId } = req.body;

    // Check if 'items' is present before attempting to map over it
    const orderItems: IOrderItem[] = items?.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      quantity: item.quantity,
    })) || [];

    // Create a new order
    const order = new Order({ userId: new mongoose.Types.ObjectId(userId), items: orderItems, totalPrice });

    // Save the order to the database
    let saveOrder = await order.save();

    let deleteCart = await Cart.findByIdAndDelete(cartId);

    res.status(201).json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;

    const lineItems = paymentData.map((item: any) => {
      const productData = item.items.productData[0]; // Assuming each item has one productData

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: productData.name,
            description: productData.description,
            images: [productData.image],
          },
          unit_amount: productData.price * 100, // Stripe requires amount in cents
        },
        quantity: item.items.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: 'required',
      success_url: "http://localhost:3000/order-success",
      cancel_url: "http://localhost:3000/order-cancel",
    });

    res.status(200).send({ message: "Success", data: { id: session.id, url: session.url } });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error, message: "Payment checkout session failed" });
  }
};

module.exports = {
  geOrders,
  getOrderById,
  createOrder,
  createCheckoutSession
}