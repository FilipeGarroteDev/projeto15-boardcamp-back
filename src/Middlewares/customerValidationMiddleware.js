import { customerSchema } from '../Schemas/customerSchema.js';

function customerValidationMiddleware(req, res, next) {
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

  next();
}

export { customerValidationMiddleware };
