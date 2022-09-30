import { connection } from '../db/db.js';

async function listCustomers(req, res) {
  const { cpf } = req.query;
  let customers;

  try {
    cpf
      ? (customers = await connection.query(
          'SELECT * FROM customers WHERE cpf ILIKE $1',
          [`${customers}%`]
        ))
      : (customers = await connection.query('SELECT * FROM customers'));
    return res.status(200).send(customers.rows);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

export { listCustomers };
