import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const About = () => {
  return (
    <div>
      <div className="text-center text-3xl pt-10 text-blue-700 font-bold tracking-wide">
        <p>About <span className="text-primary">SwasthyaSewa</span></p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 flex justify-center">
          <img
            className="w-full max-w-md rounded-xl shadow-lg border border-blue-100 object-cover"
            src={assets.header_img}
            alt="SwasthyaSewa Healthcare Platform"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-6 text-base text-gray-700">
          <p>
            <span className="font-semibold text-blue-800">Welcome to SwasthyaSewa</span> - your trusted digital healthcare partner. We are dedicated to making healthcare accessible, efficient, and patient-focused for everyone. Our platform bridges the gap between patients and healthcare providers, empowering you to manage your health with confidence and ease.
          </p>
          <p>
            At SwasthyaSewa, we leverage advanced technology to simplify appointment scheduling, maintain secure health records, and connect you with a network of verified medical professionals. Our commitment to clinical excellence and patient-centric care drives every feature we offer.
          </p>
          <b className="text-blue-700">Our Vision</b>
          <p>
            We envision a future where high-quality healthcare is just a click away for every individual. By combining innovation with compassion, SwasthyaSewa aims to deliver seamless healthcare experiences that prioritize your well-being.
          </p>
        </div>
      </div>

      <div className="text-xl my-8 text-center font-semibold text-blue-800">
        Why Choose <span className="text-primary">SwasthyaSewa?</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-16 justify-center">
        <div className="flex-1 border px-8 py-8 rounded-lg shadow-md bg-white hover:bg-blue-50 transition-all duration-300 text-gray-700 mx-2">
          <b className="text-blue-700">Effortless Scheduling</b>
          <p className="mt-2">
            Book appointments instantly with our user-friendly online system, designed to fit your busy lifestyle and reduce waiting times.
          </p>
        </div>
        <div className="flex-1 border px-8 py-8 rounded-lg shadow-md bg-white hover:bg-blue-50 transition-all duration-300 text-gray-700 mx-2">
          <b className="text-blue-700">Comprehensive Healthcare Network</b>
          <p className="mt-2">
            Access a wide network of trusted doctors, specialists, and healthcare facilities, all verified for your peace of mind.
          </p>
        </div>
        <div className="flex-1 border px-8 py-8 rounded-lg shadow-md bg-white hover:bg-blue-50 transition-all duration-300 text-gray-700 mx-2">
          <b className="text-blue-700">Personalized Health Management</b>
          <p className="mt-2">
            Receive tailored reminders, health tips, and recommendations to help you stay proactive about your well-being.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mb-10 text-center text-base text-gray-700">
        <b className="block text-blue-700 mb-2">Contact Us</b>
        <p>
          Have questions or need support? Reach out to our team at
          <span className="font-semibold text-blue-700 ml-1">swasthyasewa@gmail.com  </span>
          or call us at <span className="font-semibold text-blue-700">+977-9865947316</span>.
        </p>
        <p className="mt-2">
          SwasthyaSewa - Empowering you to take control of your health, every day.
        </p>
      </div>
    </div>
  )
}

export default About
