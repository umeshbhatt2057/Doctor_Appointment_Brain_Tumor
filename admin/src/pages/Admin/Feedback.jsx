import React, { useEffect, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const AdminFeedbackModeration = () => {
  const { pendingFeedback, getPendingFeedback, approveFeedback, rejectFeedback } = useContext(AdminContext)

  useEffect(() => { getPendingFeedback() }, [])

  return (
    <div>
      <h2 className="text-xl mb-4">Pending Feedback Moderation</h2>
      <div>
        {pendingFeedback.length === 0 && <p>No pending feedback.</p>}
        {pendingFeedback.map(fb => (
          <div key={fb._id} className="border p-3 mb-3 rounded">
            <div><b>User:</b> {fb.userData?.name}</div>
            <div><b>Doctor:</b> {fb.docData?.name}</div>
            <div><b>Rating:</b> {fb.rating}</div>
            <div><b>Feedback:</b> {fb.feedback}</div>
            <button onClick={() => approveFeedback(fb._id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Approve</button>
            <button onClick={() => rejectFeedback(fb._id)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminFeedbackModeration
