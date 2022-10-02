function querySelectorMiddleware(req, res, next) {
  const { offset, limit, order, desc } = req.query;
  let query, queryComplement;

  if (offset && limit) {
    query = 'LIMIT $1 OFFSET $2';
    queryComplement = [limit, offset];
  } else if (offset) {
    query = 'OFFSET $1';
    queryComplement = [offset];
  } else if (limit) {
    query = 'LIMIT $1';
    queryComplement = [limit];
  }

  if (order && desc) {
    query = `ORDER BY ${order} DESC`;
  } else if (order) {
    query = `ORDER BY ${order}`;
  }

  res.locals.query = query;
  res.locals.queryComplement = queryComplement;

  next();
}

export { querySelectorMiddleware };
