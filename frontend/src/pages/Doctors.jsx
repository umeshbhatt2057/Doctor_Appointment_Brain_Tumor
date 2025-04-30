import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }, [doctors, speciality])

  // Helper to render stars for average rating
  const renderStars = (avgRating) => {
    // Always a number, default to 5 stars
    const rating = typeof avgRating === 'number' && avgRating > 0 ? avgRating : 5;
    const fullStars = Math.floor(rating)
    const halfStar = rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    return (
      <span className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={'full' + i} style={{ color: '#ffc107', fontSize: '1.2rem' }}>★</span>
        ))}
        {halfStar && <span style={{ color: '#ffc107', fontSize: '1.2rem' }}>☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={'empty' + i} style={{ color: '#e4e5e9', fontSize: '1.2rem' }}>★</span>
        ))}
      </span>
    )
  }

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {/* ...filter buttons as before... */}
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item, index) => (
              <div onClick={() => navigate(`/appointment/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                <img className='bg-blue-50  w-48 h-48 overflow-hidden  flex items-center justify-center' src={item.image} alt="" />
                <div className='p-4'>
                  <div className={`flex items-center gap-2 text-sm text-center $(item.available ? ' text-green-500' : text-gray-500)`}>
                    <p className={`w-2 h-2 ${item.available ? ' bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                    <p>{item.available ? 'Available' : 'Not available'}</p>
                  </div>
                  <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                  <p className='text-red-600 font-bold text-sm'>NMC No :    {item.nmcNo}</p>
                  <p className='text-blue-700 text-sm'>{item.speciality}</p>
                  {/* Average rating display below speciality */}
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(item.rating)}
                    {/* Show average rating number if available */}
                    <span className="ml-2 text-sm text-gray-700 font-semibold">
                      {typeof item.rating === 'number' && item.rating > 0 ? item.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                  {/* Show review count if available */}
                  <div className="text-xs text-gray-500 mt-1">
                    review: {item.ratingCount || 0}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Doctors
