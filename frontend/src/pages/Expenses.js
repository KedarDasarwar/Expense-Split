import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getExpenses, deleteExpense } from '../api/expenses';

const Expenses = () => {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery('expenses', getExpenses);

  const deleteMutation = useMutation(deleteExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      setSelectedExpense(null);
    },
  });

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(expenseId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
        <Link
          to="/expenses/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {expenses?.data?.map((expense) => (
            <li key={expense._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {expense.description}
                    </p>
                    <p className="ml-2 flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ₹{expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                    <Link
                      to={`/expenses/edit/${expense._id}`}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Paid by {expense.paidBy}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {expense.participants.length} participants
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {expense.participants.map((participant) => (
                      <span
                        key={participant.name}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {participant.name} (₹{participant.share.toFixed(2)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Expenses; 