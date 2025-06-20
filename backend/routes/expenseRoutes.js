const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getSettlements,
  getBalances,
  getPeople
} = require('../controllers/expenseController');

// Validation middleware
const validateExpense = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').notEmpty().withMessage('Description is required'),
  body('paidBy').notEmpty().withMessage('Paid by is required'),
  body('participants').isArray().withMessage('Participants must be an array'),
  body('participants.*.name').notEmpty().withMessage('Participant name is required'),
  body('participants.*.share').isFloat({ min: 0 }).withMessage('Share must be a positive number'),
  body('participants.*.shareType').isIn(['equal', 'percentage', 'exact']).withMessage('Invalid share type')
];

// Routes
router.get('/expenses', getExpenses);
router.post('/expenses', validateExpense, createExpense);
// Settlement and people routes must come before /expenses/:id
router.get('/expenses/settlements', getSettlements);
router.get('/expenses/balances', getBalances);
router.get('/expenses/people', getPeople);
router.get('/expenses/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID')
], getExpense);
router.put('/expenses/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  ...validateExpense
], updateExpense);
router.delete('/expenses/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID')
], deleteExpense);

module.exports = router; 