import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleUploadClick = () => {
    if (token) {
      navigate('/check-tumor');
    } else {
     
      navigate('/login?redirect=/check-tumor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4d7cff]">
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl px-6 py-16">
        {/* Left Side */}
        <div className="md:w-1/2 flex flex-col items-start justify-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Brain Tumor <br /> Detection System
          </h1>
          <p className="text-lg text-white/90 font-light mb-4">
            Simply upload your brain scan image and let our advanced system detect brain tumors quickly and accurately.
          </p>
          <div className="flex items-center gap-2 mb-6">
            <img className="w-12 h-12 rounded-full object-cover border-2 border-white" src={assets.umesh} alt="Profile 1" />
            <img className="w-12 h-12 rounded-full object-cover border-2 border-white -ml-4" src={assets.neelam} alt="Profile 2" />
          </div>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-white px-8 py-4 rounded-full text-gray-800 text-lg font-semibold shadow hover:bg-blue-100 transition-all duration-300"
          >
            Upload Image
            <span className="ml-2">
              <img className="w-5" src={assets.arrow_icon} alt="Arrow Icon" />
            </span>
          </button>
        </div>
        {/* Right Side */}
        <div className="md:w-1/2 flex items-center justify-center relative mt-12 md:mt-0">
          {/* MRI Image */}
          <div>
            <img
              src={assets.brain}
              alt="MRI Scan"
              className="w-72 h-72 rounded-full object-cover"
            />
          </div>
          {/* Doctor Image */}
          <img
            src={assets.header_img}
            alt="Doctor"
            className="absolute right-0 bottom-0 w-52 md:w-64 z-20"
            style={{ transform: 'translateY(100%)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
