import { Router } from 'express';
import { listStores, addStore } from '../controllers/storeController';

const router = Router();

router.get('/', listStores);
router.post('/', addStore);

export default router;
