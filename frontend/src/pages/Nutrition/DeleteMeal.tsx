
import { IoChevronBack } from 'react-icons/io5';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import deleteMealIllustration from '../assets/delete-meal.png';
import { deleteMeal, deleteScheduledMeal } from '../lib/api';

export default function DeleteMeal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mealId = Number(searchParams.get('id'));
  const type = searchParams.get('type') === 'schedule' ? 'schedule' : 'history';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!mealId) {
      setError('Missing meal reference.');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      if (type === 'schedule') {
        await deleteScheduledMeal(mealId);
      } else {
        await deleteMeal(mealId);
      }
      setStatus('success');
      setTimeout(() => navigate(type === 'schedule' ? '/nutrition-schedule' : '/nutrition-history'), 1200);
    } catch {
      setStatus('error');
      setError('Failed to delete meal. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="flex flex-col items-center text-center px-8 pt-16 max-w-[480px] mx-auto">
        <img
          src={deleteMealIllustration}
          alt="Delete item"
          className="w-full max-w-[240px] h-auto"
        /> 

        <h2 className="text-2xl font-semibold text-[#1E1E1E] mt-6 leading-tight">
          Delete {type === 'schedule' ? 'scheduled meal' : 'logged meal'}?
        </h2>

        <p className="text-base text-gray-600 mt-2 max-w-xs leading-snug">
          Are you sure you want to remove this meal from your {type === 'schedule' ? 'schedule' : 'history'}?
        </p>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="w-full max-w-xs flex flex-col gap-3 mt-8">
          <button
            disabled={status === 'loading'}
            onClick={handleDelete}
            className="
              flex items-center justify-center w-full px-4 py-4 
              rounded-2xl text-base font-semibold 
              text-white bg-[#FF375F]
              shadow-[0_4px_16px_rgba(255,55,95,0.28)]
              disabled:opacity-60
            "
          >
            {status === 'loading' ? 'Deleting...' : 'Yes, Delete'}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center justify-center w-full px-4 py-4 
              rounded-2xl text-base font-semibold
              border border-[#FF375F] text-[#FF375F] bg-white
            "
          >
            No, nevermind
          </button>
        </div>

        {status === 'success' && (
          <p className="text-sm text-green-600 mt-4">Meal deleted.</p>
        )}
      </div>
    </div>
  );
}
