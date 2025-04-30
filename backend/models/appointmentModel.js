import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
   docId: { type: String, required: true },
  

  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  feedback: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  feedbackApproved: { type: Boolean, default: false },
  feedbackRejected: { type: Boolean, default: false },
  anonymousFeedback: { type: Boolean, default: false }, 
  feedbackSubmittedAt: { type: Date, default: null } 
})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)
export default appointmentModel
