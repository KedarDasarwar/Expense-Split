const Expense = require('../models/Expense');

// Helper function to calculate settlements
const calculateSettlements = (expenses) => {
  const balances = {};
  
  // Calculate net balance for each person
  expenses.forEach(expense => {
    // Add amount to payer's balance
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    
    // Subtract shares from participants' balances
    expense.participants.forEach(participant => {
      balances[participant.name] = (balances[participant.name] || 0) - participant.share;
    });
  });

  // Create settlement transactions
  const settlements = [];
  const debtors = Object.entries(balances)
    .filter(([_, balance]) => balance < 0)
    .sort((a, b) => a[1] - b[1]);
  const creditors = Object.entries(balances)
    .filter(([_, balance]) => balance > 0)
    .sort((a, b) => b[1] - a[1]);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const [debtor, debt] = debtors[i];
    const [creditor, credit] = creditors[j];
    const amount = Math.min(-debt, credit);
    
    if (amount > 0) {
      settlements.push({ from: debtor, to: creditor, amount });
    }
    
    if (-debt > credit) {
      creditors[j][1] = 0;
      debtors[i][1] += credit;
      j++;
    } else {
      debtors[i][1] = 0;
      creditors[j][1] += debt;
      i++;
    }
  }

  return settlements;
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({
      success: true,
      data: expenses,
      message: 'Expenses retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving expenses',
      error: error.message
    });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    console.log('Received expense data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['description', 'amount', 'paidBy', 'shareType', 'participants'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: 'Validation Error'
      });
    }

    // Validate shareType
    const validShareTypes = ['equal', 'percentage', 'exact'];
    if (!validShareTypes.includes(req.body.shareType)) {
      console.log('Invalid shareType:', req.body.shareType);
      return res.status(400).json({
        success: false,
        message: `Invalid shareType. Must be one of: ${validShareTypes.join(', ')}`,
        error: 'Validation Error'
      });
    }

    // Clean and validate participants
    let participants = req.body.participants.map(p => ({
      name: p.name,
      share: parseFloat(p.share)
    }));

    // If shareType is 'equal', calculate equal share for each participant
    if (req.body.shareType === 'equal') {
      const equalShare = parseFloat(req.body.amount) / participants.length;
      participants = participants.map(p => ({
        ...p,
        share: equalShare
      }));
    }

    // Validate each participant
    const invalidParticipants = participants.filter(p => !p.name || isNaN(p.share));
    if (invalidParticipants.length > 0) {
      console.log('Invalid participants data:', invalidParticipants);
      return res.status(400).json({
        success: false,
        message: 'Each participant must have a name and a numeric share',
        error: 'Validation Error'
      });
    }

    // Validate total shares
    const totalShare = participants.reduce((sum, p) => sum + p.share, 0);
    if (req.body.shareType === 'percentage' && Math.abs(totalShare - 100) > 0.01) {
      console.log('Invalid percentage total:', totalShare);
      return res.status(400).json({
        success: false,
        message: 'Total percentage shares must equal 100',
        error: 'Validation Error'
      });
    }

    if (req.body.shareType === 'exact' && Math.abs(totalShare - req.body.amount) > 0.01) {
      console.log('Invalid exact total:', totalShare, 'amount:', req.body.amount);
      return res.status(400).json({
        success: false,
        message: 'Total exact shares must equal the total amount',
        error: 'Validation Error'
      });
    }

    // Create the expense object with cleaned data
    const expenseData = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      paidBy: req.body.paidBy,
      shareType: req.body.shareType,
      participants: participants,
      category: req.body.category || 'Other',
      date: req.body.date ? new Date(req.body.date) : new Date()
    };

    console.log('Creating expense with data:', JSON.stringify(expenseData, null, 2));
    
    const expense = new Expense(expenseData);
    console.log('Created expense object:', expense);
    
    await expense.save();
    console.log('Saved expense:', expense);
    
    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    console.error('Error details:', error.message);
    console.error('Validation errors:', error.errors);
    
    res.status(400).json({
      success: false,
      message: 'Error creating expense',
      error: error.message,
      details: error.errors
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (updateData.shareType === 'equal' && Array.isArray(updateData.participants)) {
      const equalShare = parseFloat(updateData.amount) / updateData.participants.length;
      updateData.participants = updateData.participants.map(p => ({
        ...p,
        share: equalShare
      }));
    }
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// Get settlements
exports.getSettlements = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const settlements = calculateSettlements(expenses);
    
    res.json({
      success: true,
      data: settlements,
      message: 'Settlements calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating settlements',
      error: error.message
    });
  }
};

// Get balances
exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = {};
    
    expenses.forEach(expense => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      expense.participants.forEach(participant => {
        balances[participant.name] = (balances[participant.name] || 0) - participant.share;
      });
    });

    res.json({
      success: true,
      data: balances,
      message: 'Balances retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving balances',
      error: error.message
    });
  }
};

// Get all people
exports.getPeople = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = new Set();
    
    expenses.forEach(expense => {
      people.add(expense.paidBy);
      expense.participants.forEach(participant => {
        people.add(participant.name);
      });
    });

    res.json({
      success: true,
      data: Array.from(people),
      message: 'People retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving people',
      error: error.message
    });
  }
};

// Get single expense
exports.getExpense = async (req, res) => {
  try {
    console.log('Fetching expense with ID:', req.params.id);
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      console.log('Expense not found');
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    console.log('Found expense:', expense);
    res.json({
      success: true,
      data: expense,
      message: 'Expense retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getExpense:', error);
    res.status(400).json({
      success: false,
      message: 'Error retrieving expense',
      error: error.message
    });
  }
}; 