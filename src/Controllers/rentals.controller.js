import { connection } from '../db/db.js';
import { rentSchema } from '../Schemas/rentSchema.js';
import dayjs from 'dayjs';

async function listRentals(req, res) {
  const { customerId, gameId, status } = req.query;

  try {
    if (customerId) {
      const customersRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      WHERE rentals."customerId" = $1
      `,
        [customerId]
      );
      return res.status(200).send(customersRentals.rows);
    }

    if (gameId) {
      const gamesRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      WHERE rentals."gameId" = $1
      `,
        [gameId]
      );

      return res.status(200).send(gamesRentals.rows);
    }

    if (status === 'open') {
      const openRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      WHERE rentals."returnDate" IS NULL
      `
      );
      return res.status(200).send(openRentals.rows);
    } else if (status === 'closed') {
      const closedRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      WHERE rentals."returnDate" IS NOT NULL
      `
      );
      return res.status(200).send(closedRentals.rows);
    }

    if (Object.keys(req.query).length === 0) {
      const allRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      `
      );

      return res.status(200).send(allRentals.rows);
    } else {
      const { query, queryComplement } = res.locals;
      const filteredRentals = await connection.query(
        `
      SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals
        JOIN customers
          ON rentals."customerId" = customers.id
        JOIN games
          ON rentals."gameId" = games.id
        JOIN categories
          ON games."categoryId" = categories.id
      ${query}
      `,
        queryComplement
      );
      return res.status(200).send(filteredRentals.rows);
    }
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

    if (hasGame.rows[0].stockTotal === 0) {
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

    await connection.query('UPDATE games SET "stockTotal" = $1 WHERE id = $2', [
      hasGame.rows[0].stockTotal - 1,
      gameId,
    ]);

    return res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function gameReturn(req, res) {
  const { id } = req.params;
  const today = dayjs(Date.now());

  try {
    const rental = await connection.query(
      'SELECT * FROM rentals WHERE id = $1',
      [id]
    );

    if (rental.rows.length === 0) {
      return res
        .status(404)
        .send(
          'Não existe nenhum aluguel com o id informado.\nPor favor, revise os dados.'
        );
    }

    if (rental.rows[0].returnDate !== null) {
      return res
        .status(400)
        .send(
          `O aluguel referente ao id informado já foi finalizado em ${dayjs(
            rental.rows[0].returnDate
          ).format('DD-MM-YYYY')}`
        );
    }

    const returnDelay = today.diff(
      dayjs(rental.rows[0].rentDate).format('YYYY-MM-DD'),
      'day'
    );

    const delayFee =
      (rental.rows[0].originalPrice / rental.rows[0].daysRented) * returnDelay;

    await connection.query(
      'UPDATE rentals SET "delayFee" = $1, "returnDate" = $2 WHERE id = $3',
      [delayFee, today.format('YYYY-MM-DD'), id]
    );

    return res.sendStatus(201);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function deleteRent(req, res) {
  const { id } = req.params;

  try {
    const rental = await connection.query(
      'SELECT * FROM rentals WHERE id = $1',
      [id]
    );

    if (rental.rows.length === 0) {
      return res
        .status(404)
        .send(
          'Não existe nenhum aluguel com o id informado.\nPor favor, revise os dados.'
        );
    }

    if (rental.rows[0].returnDate === null) {
      return res
        .status(400)
        .send(
          `Esse aluguel ainda não foi finalizado.\nAntes de deletar o registro, finalize o aluguel.`
        );
    }

    await connection.query('DELETE FROM rentals WHERE id = $1;', [id]);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).sendo(error.message);
  }
}

export { newGameRent, listRentals, gameReturn, deleteRent };
