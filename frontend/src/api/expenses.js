import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const getExpense = async (id) => {
  try {
    console.log('Fetching expense with ID:', id);
    const response = await api.get(`/expenses/${id}`);
    console.log('API Response:', response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch expense');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error in getExpense API:', error);
    throw error;
  }
};

export const createExpense = async (expense) => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getSettlements = async () => {
  const response = await api.get('/settlements');
  return response.data;
};

export const getBalances = async () => {
  const response = await api.get('/balances');
  return response.data;
};

export const getPeople = async () => {
  const response = await api.get('/people');
  return response.data;
}; 