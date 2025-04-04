import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext); // Using backend URL from context

  // Email Validation Function
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email); // Checks for a valid email pattern
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      return toast.error('Please enter a valid email address.');
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email: trimmedEmail });

      if (data.success) {
        toast.success(`Password reset link has been sent to ${email}`);
        navigate('/login');
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg"
      >
        <p className="text-2xl font-semibold">Forgot Password</p>
        <p>Enter your email to receive a password reset link.</p>

        {/* Email Input */}
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base flex items-center justify-center"
          disabled={loading || !isValidEmail(email)}
        >
          {loading ? 'Processing...' : 'Send Reset Link'}
        </button>

        {/* Back to Login Link */}
        <p className="text-primary underline cursor-pointer text-sm mt-2" onClick={() => navigate('/login')}>
          Back to Login
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
