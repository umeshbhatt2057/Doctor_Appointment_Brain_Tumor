import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successfully. Please log in.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[80vh] flex items-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>Reset Password</p>
        <p>Enter your new password below.</p>

        <div className='w-full'>
          <p>New Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        <div className='w-full'>
          <p>Confirm Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='password'
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            required
          />
        </div>

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base' disabled={loading}>
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
