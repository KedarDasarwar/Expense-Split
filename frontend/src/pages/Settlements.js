import React from 'react';
import { useQuery } from 'react-query';
import { getSettlements, getBalances } from '../api/expenses';

const Settlements = () => {
  const { data: settlements, isLoading: settlementsLoading } = useQuery('settlements', getSettlements);
  const { data: balances, isLoading: balancesLoading } = useQuery('balances', getBalances);

  const isLoading = settlementsLoading || balancesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settlements
          </h2>
        </div>
      </div>

      {/* Balances Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Current Balances
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {Object.entries(balances?.data || {}).map(([person, amount]) => (
              <div
                key={person}
                className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                  amount > 0 ? 'bg-green-50' : amount < 0 ? 'bg-red-50' : ''
                }`}
              >
                <dt className="text-sm font-medium text-gray-500">{person}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`font-medium ${amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : ''}`}>
                    ₹{Math.abs(amount).toFixed(2)}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {amount > 0 ? 'is owed' : amount < 0 ? 'owes' : 'is settled'}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Settlements Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Settlement Transactions
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {settlements?.data?.map((settlement, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {settlement.from} pays {settlement.to}
                      </p>
                      <p className="text-sm text-gray-500">
                        Settlement #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ₹{settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {(!settlements?.data || settlements.data.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No settlements needed. All balances are settled.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Summary
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Settlements</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settlements?.data?.length || 0} transactions
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">
                ₹{settlements?.data?.reduce((sum, s) => sum + s.amount, 0).toFixed(2) || '0.00'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Settlements; 