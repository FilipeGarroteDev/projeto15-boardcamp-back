import { connection } from '../db/db.js';

async function listCategories(req, res) {
  try {
    const categories = await connection.query('SELECT * FROM categories');
    res.status(200).send(categories.rows);
  } catch (error) {
    res.status(400).send(error.message);
  }
}


export { listCategories };
