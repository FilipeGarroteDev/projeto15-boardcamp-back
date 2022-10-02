import express from 'express';
import * as customersController from '../Controllers/customers.controller.js';
import { querySelectorMiddleware } from '../Middlewares/querySelectorMiddleware.js';

const router = express();

router.get(
  '/customers',
  querySelectorMiddleware,
  customersController.listCustomers
);
router.get('/customers/:id', customersController.listSpecificUser);
router.post('/customers', customersController.createCustomer);
router.put('/customers/:id', customersController.updateUserData);

export default router;
