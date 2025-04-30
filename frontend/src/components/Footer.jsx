import React from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/* ---------- Left Section ---------- */}
        <div>
          <img onClick={() => navigate('/')} className='w-44 cursor-pointer mb-5' src={assets.swasthyasewa} alt="SwasthyaSewa Logo" />
          <ul className='hidden md:flex items-start gap-5 font-medium'>
            {/* Add other NavLink items here if needed */}
          </ul>
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Welcome to Umesh's Hospital, where your health and well-being are our top priority.
            We are a renowned healthcare institution committed to providing the highest standards of medical care 
            and patient safety. With a team of experienced doctors, nurses, and medical professionals,
            we offer a wide range of medical services to cater to all your healthcare needs.
          </p>
        </div>

        {/* ---------- Center Section ---------- */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li 
              onClick={() => navigate('/')}
              className='cursor-pointer hover:text-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300'
            >
              Home
            </li>
            <li 
              onClick={() => navigate('/about')}
              className='cursor-pointer hover:text-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300'
            >
              About us
            </li>
            <li 
              onClick={() => navigate('/contact')}
              className='cursor-pointer hover:text-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300'
            >
              Contact us
            </li>
            <li 
              onClick={() => navigate('/apply-doctor')}
              className='cursor-pointer hover:text-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300'
            >
              Apply For Doctor
            </li>
            <li 
              onClick={() => navigate('/team')}
              className='cursor-pointer hover:text-orange-500 hover:scale-105 hover:shadow-lg transition-all duration-300'
            >
              Our Team
            </li>
          </ul>
        </div>

        {/* ---------- Right Section ---------- */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+977 9865941673</li>
            <li>umeshbhatt2057@gmail.com</li>
          </ul>
        </div>

      </div>

      {/* ---------- Copyright Text ---------- */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright © 2025 - All Right Reserved.</p>
      </div>
    </div>
  );
}

export default Footer;
