import express from 'express';
import cors from 'cors';

const server = express();
server.use(express.json());
server.use(cors());

server.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
