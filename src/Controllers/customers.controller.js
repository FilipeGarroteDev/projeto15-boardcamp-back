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

async function listSpecificUser(req, res) {
  const { id } = req.params;

  try {
    const customer = await connection.query(
      'SELECT * FROM customers WHERE name = $1',
      [id]
    );
    if (customer.rows.length === 0) {
      return res
        .status(404)
        .send('Esse usuário não existe. Favor informar um id correto.');
    }

    return res.status(200).send(customer.rows[0]);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

export { listCustomers, listSpecificUser };
