import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import { v2 as cloudinary } from 'cloudinary'

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body
    const docData = await doctorModel.findById(docId)
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
    res.json({ success: true, message: 'Availability Changed' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password')
    const doctorIds = doctors.map(doc => doc._id.toString())

    const feedbacks = await appointmentModel.aggregate([
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

    const ratingMap = {}
    feedbacks.forEach(fb => {
      ratingMap[fb._id] = { avgRating: fb.avgRating, count: fb.count }
    })

    let doctorsWithRating = doctors.map(doc => {
      const ratingData = ratingMap[doc._id.toString()]
      return {
        ...doc.toObject(),
        rating: ratingData ? ratingData.avgRating : null,
        ratingCount: ratingData ? ratingData.count : 0
      }
    })

    // Sort by rating descending, then by ratingCount descending (optional)
    doctorsWithRating = doctorsWithRating.sort((a, b) => {
      // If both have ratings, sort by rating
      if (b.rating !== a.rating) {
        // If rating is null, treat as lowest
        if (b.rating === null) return -1;
        if (a.rating === null) return 1;
        return b.rating - a.rating;
      }
      // If ratings are equal or both null, sort by review count
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });

    res.json({ success: true, doctors: doctorsWithRating })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const doctor = await doctorModel.findOne({ email })

    if (!doctor) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    // Now directly compare plain text
    if (password === doctor.password) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid credentials' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {

    const { docId } = req.body
    const appointments = await appointmentModel.find({ docId })

    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentId && appointmentData.docId === docId) {

      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
      return res.json({ success: true, message: 'Appointment Completed' })

    } else {
      return res.json({ success: false, message: 'Mark Failed' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }
}

// API to cancel appointment  for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentId && appointmentData.docId === docId) {

      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
      return res.json({ success: true, message: 'Appointment Cancelled' })

    } else {
      return res.json({ success: false, message: 'Cancellation Failed' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }
}

//API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body; // Ensure the frontend sends docId correctly

    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    // Fetch all appointments for the doctor
    const appointments = await appointmentModel.find({ docId }).populate("userId", "name image");

    let earnings = 0;
    let patients = new Set(); // Use Set to avoid duplicate patient entries

    // Calculate earnings and unique patients
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount || 0; // Avoid NaN if `amount` is undefined
      }
      patients.add(item.userId.toString()); // Ensure uniqueness
    });

    // Prepare dashboard data
    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.size, // Get unique count
      latestAppointments: appointments.slice().reverse().slice(0, 5), // Safe reversal
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error("Error in doctorDashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
  try {

    const { docId } = req.body
    const profileData = await doctorModel.findById(docId).select('-password')

    res.json({ success: true, profileData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }
}

// API to update doctor profile (only image, fee, address, available)
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body
    const imageFile = req.file

    // Only update allowed fields
    const updateFields = {
      fees,
      address: address ? JSON.parse(address) : undefined,
      available,
    }

    // Remove undefined fields (if address not sent)
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key])

    await doctorModel.findByIdAndUpdate(docId, updateFields)

    // If image uploaded, upload and update
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageURL = imageUpload.secure_url
      await doctorModel.findByIdAndUpdate(docId, { image: imageURL })
    }

    res.json({ success: true, message: 'Profile Updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// API: Get all approved feedback for a doctor
const getDoctorFeedbacks = async (req, res) => {
  try {
    const { docId } = req.params
    const feedbacks = await appointmentModel.find({
      docId,
      feedback: { $ne: '' },
      feedbackApproved: true
    }).select('feedback rating userData slotDate slotTime anonymousFeedback feedbackSubmittedAt')
      .sort({ feedbackSubmittedAt: -1 });
    res.json({ success: true, feedbacks })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// api to count completed appointments
const completedAppointmentsCount = async (req, res) => {
  try {
    const { docId } = req.params;
    const count = await appointmentModel.countDocuments({ docId, isCompleted: true });
    res.json({ success: true, count });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};






export {
  changeAvailablity,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorFeedbacks,
  completedAppointmentsCount
}