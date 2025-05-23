import express from 'express'
import { appointmentCancel, appointmentComplete, appointmentsDoctor, completedAppointmentsCount, doctorDashboard, doctorList,doctorProfile,getDoctorFeedbacks,loginDoctor, updateDoctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)

doctorRouter.post('/update-profile', upload.single('image'),authDoctor, updateDoctorProfile)

doctorRouter.get('/feedbacks/:docId', getDoctorFeedbacks)

doctorRouter.get('/completed-appointments/:docId', completedAppointmentsCount);



export default doctorRouter