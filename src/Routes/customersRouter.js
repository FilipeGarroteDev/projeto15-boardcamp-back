import express from 'express';
import * as customersController from '../Controllers/customers.controller.js';
import { customerValidationMiddleware } from '../Middlewares/customerValidationMiddleware.js';
import { querySelectorMiddleware } from '../Middlewares/querySelectorMiddleware.js';

const router = express();

router.get('/customers/:id', customersController.listSpecificUser);
router.get(
  '/customers',
  querySelectorMiddleware,
  customersController.listCustomers
);
router.post(
  '/customers',
  customerValidationMiddleware,
  customersController.createCustomer
);
router.put(
  '/customers/:id',
  customerValidationMiddleware,
  customersController.updateUserData
);

export default router;
