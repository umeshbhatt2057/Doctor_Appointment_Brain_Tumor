import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctor from '../components/RelatedDoctor';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigate = useNavigate();
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({ datetime: new Date(currentDate), time: formattedTime });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment');
      return navigate('/login');
    }

    if (!selectedSlotTime) {
      toast.warn('Please select a time slot to book an appointment');
      return;
    }

    const selectedSlotDay = docSlots[selectedSlotIndex];
    if (!selectedSlotDay || selectedSlotDay.length === 0 || !selectedSlotDay[0].datetime) {
      toast.warn('Selected day has no available slots');
      return;
    }

    try {
      const date = selectedSlotDay[0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime: selectedSlotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  return docInfo && (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="Doctor" />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-6 bg-white">
          <p className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
            {docInfo.name} <img className="w-5" src={assets.verified_icon} alt="Verified" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-blue-700">
            <p className='text-lg'>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-lg rounded-full">{docInfo.experience}</button>
          </div>


          <p className=" font-medium text-red-500 mt-4">
            NMC No : <span className=" font-bold"> {docInfo.nmcNo}</span>
          </p>





          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="Info" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600 font-bold">{currencySymbol} {docInfo.fees}</span>
          </p>

          {docInfo.address && (
            <div className="mt-2">
              <p className="text-gray-500 font-medium">
                Address:
                <span className="text-gray-700 font-normal ml-2">
                  {docInfo.address.line1}
                  {docInfo.address.line2 && <>, {docInfo.address.line2}</>}
                </span>
              </p>
            </div>
          )}

          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Slots</h2>

            <div className="flex gap-3 overflow-x-auto mb-4">
              {docSlots.length > 0 &&
                docSlots.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSlotIndex(index);
                      setSelectedSlotTime('');
                    }}
                    className={`flex flex-col items-center justify-center min-w-[60px] p-3 rounded-lg cursor-pointer ${selectedSlotIndex === index ? 'bg-primary text-white' : 'border border-gray-200 text-gray-700'
                      }`}
                  >
                    <span className="text-sm">{item[0] && daysOfWeek[item[0].datetime.getDay()]}</span>
                    <span className="text-lg font-semibold">{item[0] && item[0].datetime.getDate()}</span>
                  </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {docSlots.length > 0 &&
                docSlots[selectedSlotIndex].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlotTime(item.time)}
                    className={`px-4 py-2 rounded-full cursor-pointer text-sm ${selectedSlotTime === item.time ? 'bg-primary text-white' : 'border border-gray-300 text-gray-600'
                      }`}
                  >
                    {item.time.toLowerCase()}
                  </button>
                ))}
            </div>

            <button
              onClick={bookAppointment}
              disabled={!selectedSlotTime}
              className={`text-sm font-light px-10 py-3 rounded-full transition-all duration-200
                ${!selectedSlotTime
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'}
              `}
            >
              Book an appointment
            </button>
          </div>
        </div>
      </div>

      <RelatedDoctor docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
