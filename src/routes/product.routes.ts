import express from 'express';
const productController = require('../controllers/product.controller');
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/get-products', productController.getProducts);
router.get('/get-product/:productId', productController.getProductById);
router.post('/add-product', productController.createProduct);
router.put('/update-product/:productId', productController.updateProduct);
router.delete('/delete-product/:productId', productController.deleteProduct);
router.post('/upload-image', upload.single('image'), uploadMiddleware, productController.uploadImage);

export default router;
