import { Router } from 'express';
import { saveProduct, listProducts, getProduct } from '../controllers/productController';
import { authGuard } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authGuard, saveProduct);
router.get('/', listProducts);
router.get('/:id', getProduct);

export default router;
