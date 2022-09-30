import { connection } from '../db/db.js';
import { rentSchema } from '../Schemas/rentSchema.js';
import dayjs from 'dayjs';

async function listRentals(req, res) {
  const { customerId, gameId } = req.query;

  try {
    const rentals = await connection.query('SELECT * FROM rentals');
    const customer = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [rentals]
    );

    return res.status(200).send(customers.rows);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function newGameRent(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const validation = rentSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details
      .map((error) => error.message)
      .join('\n');
    return res
      .status(400)
      .send(
        `Por gentileza, revise os campos preenchidos. Ocorreram os seguintes erros:\n\n${errors}`
      );
  }

  try {
    const hasUser = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    );
    const hasGame = await connection.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );
    const gameRentals = await connection.query(
      'SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS null',
      [gameId]
    );

    if (hasUser.rows.length === 0) {
      return res
        .status(400)
        .send(
          'O id informado do usuário não existe.\nFavor, reveja o valor informado.'
        );
    }

    if (hasGame.rows.length === 0) {
      return res
        .status(400)
        .send(
          'O id informado do jogo não existe.\nFavor, reveja o valor informado.'
        );
    }

    if (gameRentals.rows.length >= hasGame.rows[0].stockTotal) {
      return res
        .status(400)
        .send(
          'Não há unidades desse jogo disponíveis em estoque.\nVolte em breve!!'
        );
    }

    const rentDate = dayjs(Date.now()).format('YYYY-MM-DD');
    const originalPrice = daysRented * hasGame.rows[0].pricePerDay;

    await connection.query(
      'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES($1, $2, $3, $4, null, $5, null)',
      [customerId, gameId, rentDate, daysRented, originalPrice]
    );

    return res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export { newGameRent };
