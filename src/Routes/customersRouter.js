import express from 'express';
import * as customersController from '../Controllers/customers.controller.js';

const router = express();

router.get('/customers', customersController.listCustomers);
router.get('/customers/:id', customersController.listSpecificUser);
router.post('/customers', customersController.createCustomer);

export default router;
