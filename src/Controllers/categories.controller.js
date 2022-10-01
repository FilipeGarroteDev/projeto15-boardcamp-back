import { connection } from '../db/db.js';

function queries(queryString) {
  const { offset, limit, order, desc } = queryString;
  let query, queryComplement;

  if (offset && limit) {
    query = 'SELECT * FROM categories LIMIT $1 OFFSET $2';
    queryComplement = [limit, offset];
    return { query, queryComplement };
  } else if (offset) {
    query = 'SELECT * FROM categories OFFSET $1';
    queryComplement = [offset];
    return { query, queryComplement };
  } else if (limit) {
    query = 'SELECT * FROM categories LIMIT $1';
    queryComplement = [limit];
    return { query, queryComplement };
  }

  if (order && desc) {
    query = `SELECT * FROM categories ORDER BY ${order} DESC`;
    return { query };
  } else if (order) {
    query = `SELECT * FROM categories ORDER BY ${order}`;
    return { query };
  }
}

async function listCategories(req, res) {
  try {
    if (Object.keys(req.query).length === 0) {
      const categories = await connection.query('SELECT * FROM categories');
      return res.status(200).send(categories.rows);
    } else {
      const { query, queryComplement } = queries(req.query);
      const categories = await connection.query(query, queryComplement);
      return res.status(200).send(categories.rows);
    }
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

    return res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export { listCategories, createCategory };
