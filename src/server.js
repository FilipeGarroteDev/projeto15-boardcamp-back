import express from 'express';
import cors from 'cors';
import categoriesRouter from './Routes/categoriesRouter.js';
import gamesRouter from './Routes/gamesRouter.js';
import customersRouter from './Routes/customersRouter.js';

const server = express();
server.use(express.json());
server.use(cors());
server.use(categoriesRouter);
server.use(gamesRouter);
server.use(customersRouter);

server.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
