const mongoose = require('mongoose');

// Define participant schema separately
const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  share: {
    type: Number,
    required: true,
    min: [0, 'Share cannot be negative']
  }
}, { 
  _id: false,
  strict: true,
  versionKey: false
});

// Define expense schema
const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  paidBy: {
    type: String,
    required: true,
    trim: true
  },
  shareType: {
    type: String,
    enum: ['equal', 'percentage', 'exact'],
    required: true
  },
  participants: {
    type: [participantSchema],
    required: true,
    validate: {
      validator: function(participants) {
        return participants && participants.length > 0;
      },
      message: 'At least one participant is required'
    }
  },
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true,
  strict: true,
  versionKey: false
});

// Remove any existing indexes
expenseSchema.indexes().forEach(index => {
  expenseSchema.index(index[0], { background: true });
});

// Add new indexes
expenseSchema.index({ paidBy: 1, date: -1 }, { background: true });
expenseSchema.index({ 'participants.name': 1 }, { background: true });

// Pre-save middleware to clean data
expenseSchema.pre('save', function(next) {
  // Ensure participants only have name and share
  if (this.participants) {
    this.participants = this.participants.map(p => ({
      name: p.name,
      share: p.share
    }));
  }
  next();
});

// Create and export the model
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 