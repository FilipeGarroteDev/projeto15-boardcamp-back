import { connection } from '../db/db.js';
import { gameSchema } from '../Schemas/gameSchema.js';

async function listGames(req, res) {
  const { name } = req.query;
  let games;

  try {
    if (Object.keys(req.query).length === 0) {
      games = await connection.query(
        `SELECT 
          games.*, categories.name AS "categoryName", COUNT(rentals."gameId") AS "rentalsCount"
        FROM games 
        JOIN categories 
          ON games."categoryId" = categories.id
        JOIN rentals
          ON games.id = rentals."gameId"
        GROUP BY games.id, categories.name`
      );
    } else {
      const { query, queryComplement } = res.locals;
      name
        ? (games = await connection.query(
            `SELECT 
              games.*, categories.name AS "categoryName", COUNT(rentals."gameId") AS "rentalsCount"
            FROM games 
            JOIN categories 
              ON games."categoryId" = categories.id 
            JOIN rentals
              ON games.id = rentals."gameId"
            WHERE games.name ILIKE $1
            GROUP BY games.id, categories.name`,
            [`${name}%`]
          ))
        : (games = await connection.query(
            `SELECT 
              games.*, categories.name AS "categoryName", COUNT(rentals."gameId") AS "rentalsCount"
            FROM games 
            JOIN categories 
              ON games."categoryId" = categories.id
            JOIN rentals
              ON games.id = rentals."gameId"
            GROUP BY games.id, categories.name 
            ${query}`,
            queryComplement
          ));
    }

    return res.status(200).send(games.rows);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  const validation = gameSchema.validate(req.body, { abortEarly: false });

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
    const hasCategory = await connection.query(
      'SELECT * FROM categories WHERE id = $1',
      [categoryId]
    );

    if (!hasCategory.rows[0]) {
      return res
        .status(400)
        .send(
          'Não existe uma categoria com esse id.\nPor gentileza, revise o valor informado.'
        );
    }

    const hasGame = await connection.query(
      'SELECT * FROM games WHERE name = $1',
      [name]
    );

    if (hasGame.rows[0]) {
      return res
        .status(409)
        .send(
          'Esse nome de jogo já existe.\nPor gentileza, escolha outro nome.'
        );
    }

    await connection.query(
      'INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES($1, $2, $3, $4, $5)',
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    return res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export { listGames, createGame };
