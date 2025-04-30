import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { aToken, doctors, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">All Doctors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
        {doctors.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-indigo-100 rounded-2xl shadow-md flex flex-col items-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg h-[370px] w-full max-w-[270px] mx-auto"
          >
            <div className="w-full h-44 bg-indigo-50 flex items-center justify-center rounded-t-2xl overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 w-full flex flex-col justify-between px-5 py-4">
              <div>
                <p className="text-lg font-bold text-neutral-800 mb-1">
                  Dr. {item.name}
                </p>
                <p className="text-gray-500 text-sm mb-3">{item.speciality}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  onChange={() => changeAvailability(item._id)}
                  type="checkbox"
                  checked={item.available}
                  className="accent-indigo-600 scale-110"
                />
                <span className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-gray-400'}`}>
                  Available
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList
