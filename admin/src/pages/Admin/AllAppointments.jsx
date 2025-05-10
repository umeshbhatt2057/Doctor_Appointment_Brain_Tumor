import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets_admin/assets'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-2">
      <h2 className="text-2xl font-bold mb-6">All Appointments</h2>
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Table Header */}
          <div className="grid grid-cols-7 font-semibold text-gray-700 bg-gray-50 py-4 px-6 border-b">
            <span className="text-center">#</span>
            <span>Patient</span>
            <span className="text-center">Age</span>
            <span>Date &amp; Time</span>
            <span>Doctor</span>
            <span className="text-center">Fees</span>
            <span className="text-center">Actions</span>
          </div>
          {/* Table Rows */}
          {[...appointments].reverse().map((item, index) => (
            <div
              key={item._id}
              className={`grid grid-cols-7 items-center py-4 px-6 border-b text-gray-600 text-[15px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}
            >
              <span className="text-center">{index + 1}</span>
              <div className="flex items-center gap-3">
                <img
                  className="w-9 h-9 rounded-full object-cover bg-gray-200"
                  src={item.userData.image}
                  alt=""
                />
                <span className="font-medium">{item.userData.name}</span>
              </div>
              <span className="text-center">{calculateAge(item.userData.dob)}</span>
              <span>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </span>
              <div className="flex items-center gap-3">
                <img
                  className="w-9 h-9 rounded-full object-cover bg-gray-200"
                  src={item.docData.image}
                  alt=""
                />
                <span className="font-medium">{item.docData.name}</span>
              </div>
              <span className="text-center">{currency}{item.amount}</span>
              <span className="flex justify-center">
                {item.cancelled ? (
                  <span className="text-red-400 text-sm font-medium">Cancelled</span>
                ) : item.isCompleted ? (
                  <span className="text-green-500 text-sm font-medium">Completed</span>
                ) : (
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 cursor-pointer hover:scale-110 transition"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllAppointments
