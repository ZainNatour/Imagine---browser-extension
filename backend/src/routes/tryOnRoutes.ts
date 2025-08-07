import { Router } from 'express';
import { tryOnPlaceholder } from '../controllers/tryOnController';

const router = Router();

router.get('/', tryOnPlaceholder);

export default router;
