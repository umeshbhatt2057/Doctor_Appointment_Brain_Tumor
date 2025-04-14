import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBrain, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CheckTumor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [tumorType, setTumorType] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult('');
    setTumorType('');
    setConfidence('');
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.warning('Please select an MRI image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/check-tumor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const resText = res.data.result || 'No result returned';
      setResult(resText);

      const match = resText.match(/(\w+)\s+\(Confidence:\s+([\d.]+%)\)/i);
      if (match) {
        const type = match[1];
        const conf = match[2];

        if (type.toLowerCase() === 'notumor') {
          setTumorType('');
          setConfidence(conf);
          toast.success(`No Tumor Detected `);
        } else {
          setTumorType(type);
          setConfidence(conf);
          toast.error(`Tumor Detected: ${type.toUpperCase()}  `);
        }
      } else {
        setTumorType('');
        setConfidence('');
      }
    } catch (error) {
      console.error('Error checking tumor:', error);
      setResult('Error occurred during prediction.');
      toast.error('Prediction Failed! ❌');
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = () => {
    if (result.toLowerCase().includes('notumor')) return 'text-green-600';
    if (result.toLowerCase().includes('error')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAppointment = () => {
    navigate('/doctors/Neurologist');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
        <FaBrain /> Brain Tumor Detection
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />

        {preview && (
          <div className="mt-4">
            <p className="text-gray-700 text-sm mb-1">Preview:</p>
            <img
              src={preview}
              alt="MRI Preview"
              className="w-60 h-60 rounded border"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check for Tumor'}
        </button>
      </form>

      {result && (
        <div className="mt-6 text-center transition-opacity duration-500 ease-in-out animate-fade-in">
          <h3 className="text-lg font-bold">Result:</h3>
          {tumorType ? (
            <div className="mt-2">
              <p className={`text-xl font-bold ${getResultColor()} flex items-center justify-center gap-2`}>
                <FaTimesCircle className="text-red-500" />
                Tumor Detected
              </p>
              <p className="text-md text-red-700 font-semibold mt-1">
                Type: {tumorType.toUpperCase()}
              </p>
              <p className="text-xl text-gray-700 mt-1">
                Confidence: <span className="font-medium">{confidence}</span>
              </p>
              <button
                onClick={handleAppointment}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center gap-2 mx-auto"
              >
                <FaCalendarAlt /> Consult To Doctor?
              </button>
            </div>
          ) : (
            <p className="text-green-600 text-xl font-semibold mt-2 flex items-center justify-center gap-2">
              <FaCheckCircle className="text-green-500" /> No Tumor Detected
              <span className="ml-2 text-sm text-gray-700 font-medium">
                (Confidence: {confidence})
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckTumor;