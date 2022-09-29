import express from 'express';
import * as gamesController from '../Controllers/games.controller.js';

const router = express();

router.get('/games', gamesController.listGames);
router.post('/categories', gamesController.createCategory);

export default router;
