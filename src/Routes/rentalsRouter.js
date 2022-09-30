import express from 'express';
import * as rentalsController from '../Controllers/rentals.controller.js';

const router = express();

router.post('/rentals', rentalsController.newGameRent);

export default router;
