import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product.model';
import RedisClient from '../config';

const getProducts = async (_req: Request, res: Response) => {
  try {
    // Check if products data is available in Redis cache
    const cachedProducts = await RedisClient.get('products');
    if (cachedProducts) {
      // If cached data is available, return it
      const products = JSON.parse(cachedProducts);
      return res.json(products);
    }

    // If no cached data is available, fetch products from the database
    const products = await Product.find();
    // Cache the products data in Redis for future use
    RedisClient.set('products', JSON.stringify(products), (err, reply) => {
      if (err) {
        console.error('Error caching products data in Redis:', err);
      } else {
        console.log('Products data cached in Redis:', reply);
      }
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, image, description, price }: IProduct = req.body;
    const newProduct = await Product.create({ name, image, description, price });

    // Invalidate the Redis cache for products after adding a new product
    RedisClient.del('products', (err, reply) => {
      if (err) {
        console.error('Error invalidating Redis cache for products:', err);
      } else {
        console.log('Redis cache for products invalidated:', reply);
      }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const { name, image, description, price }: IProduct = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, image, description, price },
      { new: true }
    );

    // Invalidate the Redis cache for products after adding a new product
    RedisClient.del('products', (err, reply) => {
      if (err) {
        console.error('Error invalidating Redis cache for products:', err);
      } else {
        console.log('Redis cache for products invalidated:', reply);
      }
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(productId);
    console.log('deletedProduct', deletedProduct)

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the product from the Redis cache
    RedisClient.del('products', (err, reply) => {
      if (err) {
        console.error('Error removing product from Redis cache:', err);
      } else {
        console.log('Product removed from Redis cache:', reply);
      }
    });

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadImage = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, imageUrl: req.body.imageUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Error uploading image' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
}

