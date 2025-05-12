import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

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
  const [editing, setEditing] = useState({})
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
    <div className="max-w-4xl mx-auto px-2">
      <h2 className="pb-3 mt-12 font-bold text-xl text-zinc-800 border-b">My Appointments</h2>
      <div className="flex flex-col gap-8 mt-6">
        {appointments.map((item, index) => (
          <div
            key={item._id || index}
            className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow border p-6 hover:shadow-lg transition"
          >
            {/* Doctor Info */}
            <div className="flex-shrink-0 flex flex-col items-center md:items-start w-36">
              <img
                className="w-24 h-24 rounded-md object-cover bg-indigo-50 border"
                src={item.docData.image}
                alt="Doctor"
              />
              <div className="mt-3 text-center md:text-left">
                <p className="text-lg font-bold text-neutral-800">{item.docData.name}</p>
                <p className="text-sm text-zinc-600">{item.docData.speciality}</p>
              </div>
              <div className="mt-2">
                <span className="font-medium text-zinc-700 text-xs">Address:</span>
                <p className="text-xs text-zinc-500">{item.docData.address.line1}</p>
                <p className="text-xs text-zinc-500">{item.docData.address.line2}</p>
              </div>
              <p className="text-xs mt-2">
                <span className="font-medium text-neutral-700">Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            {/* Appointment Actions and Feedback */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {item.isCompleted && (
                  <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-700 font-semibold text-xs border border-green-300">
                    Completed
                  </span>
                )}
                {item.cancelled && !item.isCompleted && (
                  <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-600 font-semibold text-xs border border-red-300">
                    Appointment Cancelled
                  </span>
                )}
                {!item.isCompleted && !item.cancelled && !item.payment && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className="text-xs font-medium text-white bg-blue-600 py-1 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Pay Online
                  </button>
                )}
                {!item.isCompleted && !item.cancelled && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-xs font-medium text-red-600 border border-red-400 py-1 px-4 rounded hover:bg-red-50 transition"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
              {/* Feedback Section */}
              {item.isCompleted && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                  {item.feedback || item.rating ? (
                    editing[item._id] ? (
                      // Edit feedback form
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={e => {
                          e.preventDefault()
                          submitFeedback(item._id, true)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Your Rating:</span>
                          <StarRating
                            value={feedbackData[item._id]?.rating || item.rating}
                            onChange={star =>
                              setFeedbackData(prev => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], rating: star }
                              }))
                            }
                            readOnly={submitting[item._id]}
                          />
                        </div>
                        <textarea
                          className="border rounded p-2 text-sm"
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
                        <label className="flex items-center gap-2 text-xs">
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
                        <div className="flex gap-2 mt-2">
                          <button
                            type="submit"
                            className="py-1 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            disabled={
                              submitting[item._id] ||
                              !(feedbackData[item._id]?.feedback && feedbackData[item._id]?.rating)
                            }
                          >
                            {submitting[item._id] ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="py-1 px-4 rounded bg-gray-200 text-black"
                            onClick={() => setEditing(prev => ({ ...prev, [item._id]: false }))}
                            disabled={submitting[item._id]}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
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
                      className="flex flex-col gap-2"
                      onSubmit={e => {
                        e.preventDefault()
                        submitFeedback(item._id)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Your Rating:</span>
                        <StarRating
                          value={feedbackData[item._id]?.rating || 0}
                          onChange={star =>
                            setFeedbackData(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], rating: star }
                            }))
                          }
                          readOnly={submitting[item._id]}
                        />
                      </div>
                      <textarea
                        className="border rounded p-2 text-sm"
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
                      <label className="flex items-center gap-2 text-xs">
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
                        className="py-1 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
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
        ))}
      </div>
    </div>
  )
}

export default MyAppointments
