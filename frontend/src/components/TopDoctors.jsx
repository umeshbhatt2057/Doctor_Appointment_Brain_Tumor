import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>

      {/* Responsive grid with fixed-size cards */}
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-5 px-3 sm:px-0'>
        {doctors.slice(0, 10).map((item, index) => (
          <div
            onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
            key={index}
            className='
              bg-white border border-blue-200 rounded-2xl shadow-md
              cursor-pointer overflow-hidden flex flex-col items-center
              transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl
              w-full max-w-xs mx-auto min-h-[340px]
            '
            style={{ minHeight: 300, maxWidth: 270 }}
          >
            {/* Uniform image */}
            <img
              className='w-full h-40 object-cover bg-blue-50'
              src={item.image}
              alt={item.name}
            />
            <div className='p-4 flex flex-col items-center flex-1 w-full'>
              <div className={`flex items-center gap-2 text-sm mb-2`}>
                <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className={`${item.available ? 'text-green-600' : 'text-gray-500'}`}>{item.available ? 'Available' : 'Not available'}</span>
              </div>
              <p className='text-gray-900 text-lg font-semibold text-center'>{item.name}</p>
              <p className='text-red-600 font-bold text-sm'>NMC No :    {item.nmcNo}</p>
              <p className='text-blue-500 text-sm text-center mt-1'>{item.speciality}</p>
              
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
        className='bg-blue-50 text-gray-700 px-12 py-3 rounded-full mt-10 shadow hover:bg-blue-100 transition'
      >
        More
      </button>
    </div>
  )
}

export default TopDoctors
