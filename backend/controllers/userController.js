import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// API to register user
const registerUser = async (req, res) => {

  try {

    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Enter a valid email' })
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: 'enter a strong password' })
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name, email, password: hashedPassword
    }

    const newUser = new userModel(userData)
    const user = await newUser.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({ success: true, token })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for user login
const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'User does not exist' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid Credentials' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for forgot password
// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }

    // Generate reset token and hash it
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      html: `
        <p>We received a request to reset your password. Please click on the link below to reset your password:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="color: #007BFF; text-decoration: none;">Reset your password</a></p>
        <p>Please note, this link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Password reset link sent to email.' });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};



// APi to  Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the received token before searching
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// API to get user profile data
const getProfile = async (req, res) => {

  try {

    const { userId } = req.body
    const userData = await userModel.findById(userId).select('-password')

    res.json({ success: true, userData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to update user profile
const updateProfile = async (req, res) => {

  try {

    const { userId, name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: 'Data Missing' })
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

    if (imageFile) {

      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageURL = imageUpload.secure_url

      await userModel.findByIdAndUpdate(userId, { image: imageURL })
    }

    res.json({ success: true, message: 'Profile Updated' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to book appointment
const bookAppointment = async (req, res) => {

  try {

    const { userId, docId, slotDate, slotTime } = req.body

    const docData = await doctorModel.findById(docId).select('-password')

    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' })
    }

    let slots_booked = docData.slots_booked

    // checking for slot availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' })
      } else {
        slots_booked[slotDate].push(slotTime)
      }
    } else {
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    delete docData.slots_booked

    const appointmentData = {
      userId, docId,
      userData, docData,
      amount: docData.fees,
      slotTime, slotDate,
      date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Booked' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {

  try {

    const { userId } = req.body
    const appointments = await appointmentModel.find({ userId })

    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {

  try {

    const { userId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

export {
  registerUser,
  loginUser,
  forgotPassword,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment
}