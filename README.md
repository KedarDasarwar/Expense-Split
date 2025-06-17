# Expense Splitter

A full-stack application for splitting expenses among friends, roommates, or groups. Built with Node.js, Express, MongoDB, and React.

Frontend Url:https://expense-split-eight.vercel.app/
Backend Url:https://expense-split-1csf.onrender.com
## Features

- Create and manage expenses with multiple participants
- Support for different expense sharing methods:
  - Equal split
  - Percentage-based split
  - Exact amount split
- Automatic settlement calculations
- Real-time balance tracking
- Clean and intuitive user interface

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Express Validator

### Frontend
- React
- React Query
- React Hook Form
- React Router
- Tailwind CSS
- Heroicons

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-splitter
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-splitter
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Settlements
- `GET /api/expenses/settlements` - Get all settlements
- `GET /api/expenses/balances` - Get current balances
- `GET /api/expenses/people` - Get all people involved

## Project Structure

```
expense-splitter/
├── backend/
│   ├── config/
│   │   └── db.js
│   │   └── expenseController.js
│   │   └── Expense.js
│   │   └── expenseRoutes.js
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── expenses.js
    │   │   └── Navbar.js
    │   │   ├── Dashboard.js
    │   │   ├── Expenses.js
    │   │   ├── AddExpense.js
    │   │   └── Settlements.js
    │   │   └── App.js
    │   └── index.js
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
