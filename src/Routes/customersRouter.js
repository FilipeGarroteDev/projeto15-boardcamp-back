import express from 'express';
import * as customersController from '../Controllers/customers.controller.js';

const router = express();

router.get('/customers', customersController.listCustomers);

export default router;
