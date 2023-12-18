import { Request, Response } from 'express';
import Cart, { ICart, ICartItem } from '../models/Cart.model';

const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const cart = await Cart.find({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const populatedCart = await Cart.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $unwind: '$items',
      },
      {
        $addFields: {
          'items.productId': { $toObjectId: '$items.productId' }, // Convert productId to ObjectId
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'items.productData',
        },
      },
      {
        $project: {
          userId: 1,
          items: {
            productId: '$items.productId', // Use the original productId if needed
            quantity: '$items.quantity',
            productData: '$items.productData',
          },
        },
      },
    ]);

    if (populatedCart.length > 0) {
      res.json(populatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity }: ICartItem = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if not exists
      cart = await Cart.create({ userId, items: [{ productId, quantity }] });
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (existingItemIndex !== -1) {
        // If the product is already in the cart, update the quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // If the product is not in the cart, add it
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;
    const action = req.params.action; // 'increment' or 'decrement'

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cart.items.find((item: any) => item.productId === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity based on the action
    if (action === 'increment') {
      cartItem.quantity += 1;
    } else if (action === 'decrement') {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        // Optionally, you can remove the item from the cart if the quantity becomes 0
        cart.items = cart.items.filter((item) => item.productId !== productId);
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem
}
