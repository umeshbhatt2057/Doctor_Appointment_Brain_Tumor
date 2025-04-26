import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(null)

  const updateProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('docId', profileData._id)
      formData.append('fees', profileData.fees)
      formData.append('address', JSON.stringify(profileData.address))
      formData.append('available', profileData.available)
      if (image) formData.append('image', image)

      const { data } = await axios.post(
        backendUrl + '/api/doctor/update-profile',
        formData,
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        setImage(null)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (dToken) getProfileData()
  }, [dToken])

  return profileData && (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          {isEdit ? (
            <label htmlFor="image">
              <div className='inline-block relative cursor-pointer'>
                <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg opacity-75'
                  src={image ? URL.createObjectURL(image) : profileData.image}
                  alt=""
                />
              </div>
              <input
                type="file"
                id="image"
                hidden
                accept="image/*"
                onChange={e => setImage(e.target.files[0])}
              />
            </label>
          ) : (
            <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
          )}
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg py-7 bg-white'>
          {/* Name (read-only) */}
          <div className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
            {profileData.name}
          </div>



          {/* Degree, Speciality, Experience (read-only) */}
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
          </div>

          {/* Name (read-only) */}
          <div className='flex items-center gap-2 text-xl font-medium text-red-500'>
            <span>NMC No :</span>
            <span>{profileData.nmcNo}</span>
          </div>


          {/* About (read-only) */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About:</p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{profileData.about}</p>
          </div>

          {/* Fees (editable) */}
          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: <span className='text-gray-800'>
              {currency} {isEdit
                ? <input
                  type="number"
                  className='bg-gray-50 max-w-24'
                  onChange={e => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                  value={profileData.fees}
                />
                : profileData.fees}
            </span>
          </p>

          {/* Address (editable) */}
          <div className='flex gap-2 py-2'>
            <p>Address:</p>
            <p className='text-sm'>
              {isEdit
                ? <>
                  <input
                    className='bg-gray-100'
                    type="text"
                    onChange={e => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    value={profileData.address?.line1 || ''}
                    placeholder="Line 1"
                  />
                  <br />
                  <input
                    className='bg-gray-100'
                    type="text"
                    onChange={e => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    value={profileData.address?.line2 || ''}
                    placeholder="Line 2"
                  />
                </>
                : <>
                  {profileData.address?.line1}
                  <br />
                  {profileData.address?.line2}
                </>
              }
            </p>
          </div>

          {/* Available (editable) */}
          <div className='flex gap-1 pt-2'>
            {isEdit
              ? <>
                <input
                  type="checkbox"
                  checked={profileData.available}
                  onChange={() => setProfileData(prev => ({ ...prev, available: !prev.available }))}
                />
                <label>Available</label>
              </>
              : <>
                <input
                  type="checkbox"
                  checked={profileData.available}
                  readOnly
                />
                <label>Available</label>
              </>
            }
          </div>

          {/* Save/Edit Button */}
          <div className='mt-6'>
            {isEdit
              ? <button
                onClick={updateProfile}
                className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
              >Save</button>
              : <button
                onClick={() => setIsEdit(true)}
                className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
              >Edit</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
