import joi from 'joi';

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(11),
  cpf: joi
    .string()
    .pattern(/^[0-9]+$/)
    .length(11),
  birthday: joi.date().less('now').greater('1899-12-31'),
});

export { customerSchema };
