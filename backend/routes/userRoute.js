import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, forgotPassword, resetPassword, submitFeedback, editFeedback } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)

userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);


// --- New route for feedback ---
userRouter.post('/submit-feedback', authUser, submitFeedback);
userRouter.post('/edit-feedback', authUser, editFeedback);



export default userRouter