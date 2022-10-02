import express from 'express';
import * as gamesController from '../Controllers/games.controller.js';
import { querySelectorMiddleware } from '../Middlewares/querySelectorMiddleware.js';

const router = express();

router.get('/games', querySelectorMiddleware, gamesController.listGames);
router.post('/games', gamesController.createGame);

export default router;
