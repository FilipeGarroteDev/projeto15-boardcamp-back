import express from 'express';
import * as categoriesController from '../Controllers/categories.controller.js';
import { querySelectorMiddleware } from '../Middlewares/querySelectorMiddleware.js';

const router = express();

router.get(
  '/categories',
  querySelectorMiddleware,
  categoriesController.listCategories
);
router.post('/categories', categoriesController.createCategory);

export default router;
