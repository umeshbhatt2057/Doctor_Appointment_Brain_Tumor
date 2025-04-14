import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBrain, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
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
        headers: { 'Content-Type': 'multipart/form-data' },
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
          toast.success(`No Tumor Detected`);
        } else {
          setTumorType(type);
          setConfidence(conf);
          toast.error(`Tumor Detected: ${type.toUpperCase()}`);
        }
      } else {
        setTumorType('');
        setConfidence('');
      }
    } catch (error) {
      console.error('Error checking tumor:', error);
      setResult('Error occurred during prediction.');
      setTumorType('');
      setConfidence('');
      toast.error('Prediction Failed! ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointment = () => {
    navigate('/doctors/Neurologist');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <FaBrain /> Brain Tumor Detection
          </h2>
          <label className="block mb-3 text-gray-700 font-medium">Upload MRI Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium mb-4"
          />
          {image && (
            <p className="text-gray-600 text-sm mb-2">{image.name}</p>
          )}
          {preview && (
            <div>
              <p className="text-gray-700 font-medium mb-2">Image Preview:</p>
              <img src={preview} alt="MRI Preview" className="rounded-lg border w-64 h-64 object-contain" />
            </div>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check for Tumor'}
          </button>
        </div>

        {/* RIGHT SIDE - ANALYSIS RESULT AT TOP */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 text-center">Analysis Results</h3>
            {result && !result.toLowerCase().includes('error') ? (
              tumorType ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 w-full">
                  <p className="text-red-600 text-3xl font-bold mb-2 text-center">Tumor Detected</p>
                  <p className="text-md text-gray-700 mb-1 text-center">
                    <span className="font-semibold">Type:</span> {tumorType.toUpperCase()}
                  </p>
                  <p className="text-md text-gray-700 text-center">
                    <span className="font-semibold">Confidence:</span> {confidence}
                  </p>
                  <button
                    onClick={handleAppointment}
                    className="mt-5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaCalendarAlt /> Consult to Doctor?
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 w-full text-center">
                  <p className="text-green-600 text-xl font-semibold flex justify-center items-center gap-2">
                    <FaCheckCircle /> No Tumor Detected
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Confidence: {confidence}
                  </p>
                </div>
              )
            ) : result.toLowerCase().includes('error') ? (
              <div className="text-yellow-600 text-lg font-semibold text-center">
                ⚠️ Error occurred during prediction. Please try again.
              </div>
            ) : (
              <p className="text-gray-500 text-center ">Upload an MRI image and click "Check for Tumor"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckTumor;
