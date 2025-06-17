import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { getExpense, updateExpense } from '../api/expenses';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [shareType, setShareType] = useState('equal');

  const { data: expense, isLoading } = useQuery(['expense', id], () => getExpense(id), {
    onSuccess: (data) => {
      console.log('Expense data loaded:', data);
    },
    onError: (error) => {
      console.error('Error loading expense:', error);
    }
  });

  const { register, handleSubmit, control, watch, formState: { errors }, setValue, reset } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants"
  });

  useEffect(() => {
    if (expense) {
      console.log('Setting form values with expense:', expense);
      // Set the form values when expense data is loaded
      reset({
        description: expense.description,
        amount: expense.amount,
        paidBy: expense.paidBy,
        date: new Date(expense.date).toISOString().split('T')[0],
        participants: expense.participants.map(p => ({
          name: p.name,
          share: p.share
        })),
        category: expense.category || 'Other'
      });
      setShareType(expense.shareType || 'equal');
    }
  }, [expense, reset, setShareType]);

  const updateMutation = useMutation(
    (data) => updateExpense(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        navigate('/expenses');
      },
      onError: (error) => {
        console.error('Error updating expense:', error.response?.data || error.message);
      }
    }
  );

  const onSubmit = (data) => {
    console.log('Form data:', data);

    const amount = parseFloat(data.amount);
    
    // Create clean participant objects with only name and share
    const participants = data.participants.map(p => {
      const share = shareType === 'equal' ? amount / data.participants.length :
                   shareType === 'percentage' ? (amount * parseFloat(p.share)) / 100 :
                   parseFloat(p.share);
      
      return {
        name: p.name,
        share: share
      };
    });

    // Create clean request data
    const requestData = {
      description: data.description,
      amount: amount,
      paidBy: data.paidBy,
      date: data.date || new Date().toISOString(),
      shareType: shareType,
      participants: participants,
      category: data.category || 'Other'
    };

    // Log the exact data being sent
    console.log('Sending request data:', JSON.stringify(requestData, null, 2));
    console.log('Share type:', shareType);

    // Send the request
    updateMutation.mutate(requestData);
  };

  const addParticipant = () => {
    const currentParticipants = watch('participants');
    setValue('participants', [
      ...currentParticipants,
      { name: '', share: '' }
    ]);
  };

  const removeParticipant = (index) => {
    const currentParticipants = watch('participants');
    if (currentParticipants.length > 1) {
      setValue('participants', currentParticipants.filter((_, i) => i !== index));
    }
  };

  // Calculate remaining amount or percentage
  const calculateRemaining = () => {
    const totalAmount = parseFloat(watch('amount') || 0);
    const participants = watch('participants') || [];
    
    if (shareType === 'exact') {
      const totalShared = participants.reduce((sum, p) => sum + (parseFloat(p.share) || 0), 0);
      const remaining = totalAmount - totalShared;
      return {
        remaining,
        isValid: Math.abs(remaining) < 0.01, // Allow for small floating point differences
        message: `Remaining amount: ₹${remaining.toFixed(2)}`
      };
    } else if (shareType === 'percentage') {
      const totalPercentage = participants.reduce((sum, p) => sum + (parseFloat(p.share) || 0), 0);
      const remaining = 100 - totalPercentage;
      return {
        remaining,
        isValid: Math.abs(remaining) < 0.01,
        message: `Remaining percentage: ${remaining.toFixed(2)}%`
      };
    }
    return { remaining: 0, isValid: true, message: '' };
  };

  const remainingInfo = calculateRemaining();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Expense</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              {...register("description", { required: "Description is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              id="amount"
              {...register("amount", { 
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Paid By */}
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">
              Paid By
            </label>
            <input
              type="text"
              id="paidBy"
              {...register("paidBy", { required: "Paid by is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.paidBy && (
              <p className="mt-2 text-sm text-red-600">{errors.paidBy.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              {...register("date", { required: "Date is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.date && (
              <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Share Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Share Type</label>
            <select
              value={shareType}
              onChange={(e) => setShareType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="equal">Equal</option>
              <option value="percentage">Percentage</option>
              <option value="exact">Exact Amount</option>
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Participants</label>
            {fields.map((field, index) => (
              <div key={field.id} className="mt-2 flex items-center space-x-2">
                <input
                  {...register(`participants.${index}.name`)}
                  placeholder="Name"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <input
                  {...register(`participants.${index}.share`)}
                  type="number"
                  step="0.01"
                  placeholder={shareType === 'percentage' ? 'Percentage' : 'Amount'}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ name: '', share: '' })}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Participant
            </button>
          </div>

          {/* Add remaining amount/percentage display */}
          {shareType !== 'equal' && (
            <div className={`mt-2 p-3 rounded-md ${remainingInfo.isValid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              <p className="text-sm font-medium">
                {remainingInfo.message}
                {!remainingInfo.isValid && (
                  <span className="block mt-1 text-red-600">
                    {shareType === 'exact' 
                      ? 'Total shares must equal the expense amount'
                      : 'Total percentage must equal 100%'}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!remainingInfo.isValid}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              !remainingInfo.isValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Update Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpense; 