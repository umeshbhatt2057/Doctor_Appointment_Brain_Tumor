import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

// Star rating component
const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => !readOnly && onChange(star)}
        tabIndex={readOnly ? -1 : 0}
        style={{
          color: star <= value ? '#ffc107' : '#e4e5e9',
          fontSize: '1.5rem',
          cursor: readOnly ? 'default' : 'pointer',
          outline: 'none'
        }}
      >
        ★
      </span>
    ))}
  </div>
)

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [feedbackData, setFeedbackData] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [editing, setEditing] = useState({}) // { [appointmentId]: true/false }
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + ' ' + months[Number(dateArray[1])] + ' ' + dateArray[2]
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) setAppointments(data.appointments.reverse())
    } catch (error) {
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Submit or edit feedback for completed appointment
  const submitFeedback = async (appointmentId, isEdit = false) => {
    const { feedback, rating, anonymousFeedback } = feedbackData[appointmentId] || {}
    if (!feedback || !rating) {
      toast.error("Please provide feedback and rating")
      return
    }
    setSubmitting((prev) => ({ ...prev, [appointmentId]: true }))
    try {
      const url = isEdit
        ? backendUrl + '/api/user/edit-feedback'
        : backendUrl + '/api/user/submit-feedback'
      const { data } = await axios.post(
        url,
        { appointmentId, feedback, rating, anonymousFeedback },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        setEditing((prev) => ({ ...prev, [appointmentId]: false }))
        setFeedbackData((prev) => ({ ...prev, [appointmentId]: {} }))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting((prev) => ({ ...prev, [appointmentId]: false }))
    }
  }

  useEffect(() => {
    if (token) getUserAppointments()
    // eslint-disable-next-line
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b '>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b hover:bg-gray-50' key={item._id || index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-sm mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 items-center justify-center '>
              <div className='flex flex-col gap-2 justify-end hover:bg-gray-100'>
                {/* Pay Online button */}
                {!item.isCompleted && !item.cancelled && !item.payment && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className='text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                    Pay Online
                  </button>
                )}
                {/* Cancel Appointment button */}
                {!item.isCompleted && !item.cancelled && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>
                    Cancel Appointment
                  </button>
                )}
                {/* Appointment Cancelled button */}
                {item.cancelled && !item.isCompleted && (
                  <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                    Appointment Cancelled
                  </button>
                )}
                {/* Completed button & feedback */}
                {item.isCompleted && (
                  <div className="flex flex-col items-center gap-2">
                    <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 bg-green-100 mb-1' disabled>
                      Completed
                    </button>
                    {/* If feedback already submitted, show it */}
                    {item.feedback || item.rating ? (
                      editing[item._id] ? (
                        // Edit feedback form
                        <form
                          className="flex flex-col gap-2 w-full"
                          onSubmit={e => {
                            e.preventDefault()
                            submitFeedback(item._id, true)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Your Rating:</span>
                            <StarRating
                              value={feedbackData[item._id]?.rating || item.rating}
                              onChange={star => setFeedbackData(prev => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], rating: star }
                              }))}
                              readOnly={submitting[item._id]}
                            />
                          </div>
                          <textarea
                            className="border rounded p-1 text-sm"
                            rows={2}
                            placeholder="Edit your feedback..."
                            value={feedbackData[item._id]?.feedback ?? item.feedback}
                            onChange={e =>
                              setFeedbackData(prev => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], feedback: e.target.value }
                              }))
                            }
                            disabled={submitting[item._id]}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={feedbackData[item._id]?.anonymousFeedback ?? item.anonymousFeedback}
                              onChange={e =>
                                setFeedbackData(prev => ({
                                  ...prev,
                                  [item._id]: {
                                    ...prev[item._id],
                                    anonymousFeedback: e.target.checked
                                  }
                                }))
                              }
                              disabled={submitting[item._id]}
                            />
                            Submit as Anonymous
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="py-1 px-3 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
                              disabled={
                                submitting[item._id] ||
                                !(feedbackData[item._id]?.feedback && feedbackData[item._id]?.rating)
                              }
                            >
                              {submitting[item._id] ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              className="py-1 px-3 rounded bg-gray-300 text-black"
                              onClick={() => setEditing(prev => ({ ...prev, [item._id]: false }))}
                              disabled={submitting[item._id]}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="w-full bg-gray-50 border rounded p-2 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">Your Rating:</span>
                            <StarRating value={item.rating} onChange={() => {}} readOnly />
                          </div>
                          <div>
                            <span className="font-semibold text-sm">Your Feedback:</span>
                            <p className="ml-2 text-gray-700 text-sm">{item.feedback}</p>
                          </div>
                          {item.anonymousFeedback && (
                            <div className="text-xs text-orange-500 mt-1">You submitted this feedback as Anonymous</div>
                          )}
                          
                          <button
                            className="mt-2 text-xs text-blue-600 underline"
                            onClick={() => {
                              setEditing(prev => ({ ...prev, [item._id]: true }))
                              setFeedbackData(prev => ({
                                ...prev,
                                [item._id]: {
                                  feedback: item.feedback,
                                  rating: item.rating,
                                  anonymousFeedback: item.anonymousFeedback
                                }
                              }))
                            }}
                          >
                            Edit Feedback
                          </button>
                        </div>
                      )
                    ) : (
                      // Feedback form
                      <form
                        className="flex flex-col gap-2 w-full"
                        onSubmit={e => {
                          e.preventDefault()
                          submitFeedback(item._id)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Your Rating:</span>
                          <StarRating
                            value={feedbackData[item._id]?.rating || 0}
                            onChange={star => setFeedbackData(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], rating: star }
                            }))}
                            readOnly={submitting[item._id]}
                          />
                        </div>
                        <textarea
                          className="border rounded p-1 text-sm"
                          rows={2}
                          placeholder="Write your feedback..."
                          value={feedbackData[item._id]?.feedback || ''}
                          onChange={e =>
                            setFeedbackData(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], feedback: e.target.value }
                            }))
                          }
                          disabled={submitting[item._id]}
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={feedbackData[item._id]?.anonymousFeedback || false}
                            onChange={e =>
                              setFeedbackData(prev => ({
                                ...prev,
                                [item._id]: {
                                  ...prev[item._id],
                                  anonymousFeedback: e.target.checked
                                }
                              }))
                            }
                            disabled={submitting[item._id]}
                          />
                          Submit as Anonymous
                        </label>
                        <button
                          type="submit"
                          className="py-1 px-3 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
                          disabled={
                            submitting[item._id] ||
                            !(feedbackData[item._id]?.feedback && feedbackData[item._id]?.rating)
                          }
                        >
                          {submitting[item._id] ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments
