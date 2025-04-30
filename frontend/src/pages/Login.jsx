import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState('Login'); // "Login" or "Sign Up"
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from query string, e.g. /login?redirect=/check-tumor
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect');

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = state === 'Sign Up' ? '/api/user/register' : '/api/user/login';
      const payload = state === 'Sign Up' ? { name, email, password } : { email, password };

      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);

        // Redirect to intended page if present, else home
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect to home (or intended page)
  useEffect(() => {
    if (token) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
    // eslint-disable-next-line
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg bg-white'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type='text'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className='w-full relative'>
          <p>Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1 pr-10'
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <span className='absolute right-3 top-9 cursor-pointer text-gray-600' onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <p className='text-primary underline cursor-pointer text-sm mt-1' onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </p>

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base' disabled={loading}>
          {loading ? 'Processing...' : state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{' '}
            <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
