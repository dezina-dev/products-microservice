import express from 'express';
import { connectToDatabase } from './config/database';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import dotenv from 'dotenv';
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
