import { connection } from '../db/db.js';

async function listGames(req, res) {
  const { name } = req.query;

  try {
    const games = await connection.query(
      'SELECT * FROM games WHERE name LIKE $1',
      [`${name}%`]
    );
    return res.status(200).send(games.rows);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function createCategory(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send('O nome da categoria não pode estar vazio');
  }

  try {
    const hasCategory = await connection.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );

    if (hasCategory.rows[0]) {
      return res
        .status(409)
        .send(
          'Esse nome de categoria já existe.\nPor gentileza, escolha outro nome.'
        );
    }

    await connection.query('INSERT INTO categories (name) VALUES($1)', [name]);

    return res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export { listGames, createCategory };
