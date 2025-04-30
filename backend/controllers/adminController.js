import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

// API for adding doctor
const addDoctor = async (req, res) => {

  try {

    const { name, email, password, speciality, degree, experience, about, fees, address, nmcNo } = req.body
    const imageFile = req.file

    // checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !nmcNo) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' })
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: 'Password must be atleast of 8 characters' })
    }

    // Check if NMC No already exists
    const existingDoctor = await doctorModel.findOne({ nmcNo });
    if (existingDoctor) {
      return res.json({ success: false, message: 'NMC Number already exists' });
    }

    // hashing doctor password
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt)

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
    const imageUrl = imageUpload.secure_url

    const doctorData = {
      name, email, image: imageUrl, password, speciality, nmcNo,
      degree, experience, about, fees, address: JSON.parse(address), date: Date.now()
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    res.json({ success: true, message: 'Doctor Added' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for admin Login
const loginAdmin = async (req, res) => {
  try {

    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid Credentials' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all doctors list for admin panel (and for frontend doctor list)
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password')
const doctorIds = doctors.map(doc => doc._id.toString())

const feedbacks = await appointmentModel.aggregate([
  // Convert docId to string if it's not already
  {
    $addFields: {
      docIdStr: { $toString: "$docId" }
    }
  },
  {
    $match: {
      docIdStr: { $in: doctorIds },
      feedbackApproved: true,
      rating: { $ne: null }
    }
  },
  {
    $group: {
      _id: '$docIdStr',
      avgRating: { $avg: '$rating' },
      count: { $sum: 1 }
    }
  }
])


    // Map docId to rating data
    const ratingMap = {}
    feedbacks.forEach(fb => {
      ratingMap[fb._id] = { avgRating: fb.avgRating, count: fb.count }
    })

    // Attach rating and count to each doctor
    const doctorsWithRating = doctors.map(doc => {
      const ratingData = ratingMap[doc._id.toString()]
      return {
        ...doc.toObject(),
        rating: ratingData ? ratingData.avgRating : null,
        ratingCount: ratingData ? ratingData.count : 0
      }
    })

    res.json({ success: true, doctors: doctorsWithRating })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}



// API to get all appointments list
const appointmentsAdmin = async (req, res) => {

  try {

    const appointments = await appointmentModel.find({})
    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {

  try {

    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

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

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {

  try {

    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      lastestAppointments: appointments.reverse().slice(0, 5)
    }

    res.json({ success: true, dashData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}


// Get all feedback pending approval
const getPendingFeedback = async (req, res) => {
  try {
    const pending = await appointmentModel.find({
      feedback: { $ne: '' },
      feedbackApproved: false,
      feedbackRejected: false
    })
    res.json({ success: true, feedbacks: pending })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Approve feedback
const approveFeedback = async (req, res) => {
  try {
    const { appointmentId } = req.body
    await appointmentModel.findByIdAndUpdate(appointmentId, { feedbackApproved: true, feedbackRejected: false })
    res.json({ success: true, message: 'Feedback approved' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Reject feedback
const rejectFeedback = async (req, res) => {
  try {
    const { appointmentId } = req.body
    await appointmentModel.findByIdAndUpdate(appointmentId, { feedbackApproved: false, feedbackRejected: true })
    res.json({ success: true, message: 'Feedback rejected' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  getPendingFeedback,
  approveFeedback,
  rejectFeedback
}