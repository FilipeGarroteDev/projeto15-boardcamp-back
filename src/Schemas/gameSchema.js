import joi from 'joi';

const gameSchema = joi.object({
  name: joi.string().required(),
  image: joi.string().optional(),
  stockTotal: joi.number().min(1).required(),
  categoryId: joi.number().required(),
  pricePerDay: joi.number().min(1).required(),
});

export { gameSchema };
