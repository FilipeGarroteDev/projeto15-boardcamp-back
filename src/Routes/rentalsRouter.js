import express from 'express';
import * as rentalsController from '../Controllers/rentals.controller.js';
import { querySelectorMiddleware } from '../Middlewares/querySelectorMiddleware.js';

const router = express();

router.post('/rentals', rentalsController.newGameRent);
router.post('/rentals/:id/return', rentalsController.gameReturn);
router.delete('/rentals/:id', rentalsController.deleteRent);
router.get('/rentals', querySelectorMiddleware, rentalsController.listRentals);

export default router;
