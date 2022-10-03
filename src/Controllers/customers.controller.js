import { connection } from '../db/db.js';
import { customerSchema } from '../Schemas/customerSchema.js';

async function listCustomers(req, res) {
  const { cpf } = req.query;
  let customers;

  try {
    if (Object.keys(req.query).length === 0) {
      customers = await connection.query(
        `SELECT 
          customers.*, COUNT(rentals."customerId") AS "rentalsCount"
        FROM customers
        JOIN rentals
          ON customers.id = rentals."customerId"
        GROUP BY customers.id`
      );
    } else {
      const { query, queryComplement } = res.locals;
      cpf
        ? (customers = await connection.query(
            `SELECT 
              customers.*, COUNT(rentals."customerId") AS "rentalsCount"
            FROM customers
            JOIN rentals
              ON customers.id = rentals."customerId"
              WHERE cpf LIKE $1
            GROUP BY customers.id `,
            [`${cpf}%`]
          ))
        : (customers = await connection.query(
            `SELECT 
              customers.*, COUNT(rentals."customerId") AS "rentalsCount" 
            FROM customers 
            JOIN rentals 
              ON customers.id = rentals."customerId" 
            GROUP BY customers.id 
            ${query}`,
            queryComplement
          ));
    }

    return res.status(200).send(customers.rows);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function listSpecificUser(req, res) {
  const { id } = req.params;

  try {
    const customer = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [Number(id)]
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

async function createCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customerSchema.validate(req.body, { abortEarly: false });

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
      'SELECT * FROM customers WHERE cpf = $1',
      [cpf]
    );

    if (hasUser.rows[0]) {
      return res
        .status(409)
        .send(
          'Já existe um usuário com esse CPF.\nPor gentileza, revise o número informado.'
        );
    }

    await connection.query(
      'INSERT INTO customers (name, phone, cpf, birthday) VALUES($1, $2, $3, $4)',
      [name, phone, cpf, birthday]
    );

    return res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function updateUserData(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customerSchema.validate(req.body, { abortEarly: false });
  const { id } = req.params;

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
      'SELECT * FROM customers WHERE cpf = $1 AND id <> $2',
      [cpf, Number(id)]
    );

    if (hasUser.rows[0]) {
      return res
        .status(409)
        .send(
          'Já existe um usuário com esse CPF.\nPor gentileza, revise o número informado.'
        );
    }

    await connection.query(
      'UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5',
      [name, phone, cpf, birthday, Number(id)]
    );

    return res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export { listCustomers, listSpecificUser, createCustomer, updateUserData };
