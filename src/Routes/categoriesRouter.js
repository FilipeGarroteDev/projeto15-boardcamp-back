import express from 'express';
import * as categoriesController from '../Controllers/categories.controller.js';

const router = express();

router.get('/categories', categoriesController.listCategories);
router.post('/categories', categoriesController.createCategory);

export default router;
