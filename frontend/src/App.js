import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settlements from './pages/Settlements';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/expenses/add" element={<AddExpense />} />
              <Route path="/expenses/edit/:id" element={<EditExpense />} />
              <Route path="/settlements" element={<Settlements />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 