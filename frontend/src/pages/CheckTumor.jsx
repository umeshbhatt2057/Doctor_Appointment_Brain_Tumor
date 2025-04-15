import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBrain, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const tumorSymptoms = {
  glioma: [
    'Persistent headaches',
    'Seizures',
    'Nausea or vomiting',
    'Blurred vision or double vision',
    'Difficulty with balance or coordination',
  ],
  meningioma: [
    'Changes in vision',
    'Hearing loss or ringing in the ears',
    'Loss of smell',
    'Memory loss',
    'Weakness in arms or legs',
  ],
  pituitary: [
    'Hormonal imbalance',
    'Vision problems',
    'Unexplained weight changes',
    'Menstrual irregularities',
    'Fatigue',
  ],
  notumor: [],
};

const CheckTumor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [tumorType, setTumorType] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  // Animate progress bar
  useEffect(() => {
    if (loading) {
      let count = 0;
      const interval = setInterval(() => {
        count += 2; // Increment
        setProgress((prev) => Math.min(count, 100));
        if (count >= 100) clearInterval(interval);
      }, 100); // Runs every 100ms => 2.5 * (1000 / 100) = 25 steps => ~4s total
      return () => clearInterval(interval);
    }
  }, [loading]);
  

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
      setProgress(0);

      const res = await axios.post('http://localhost:5000/api/check-tumor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Wait 3 seconds for progress animation to complete
      setTimeout(() => {
        const resText = res.data.result || 'No result returned';
        setResult(resText);

        const match = resText.match(/(\w+)\s+\(Confidence:\s+([\d.]+%)\)/i);
        if (match) {
          const type = match[1];
          const conf = match[2];

          if (type.toLowerCase() === 'notumor') {
            setTumorType('');
            setConfidence(conf);
            toast.success('No Tumor Detected');
          } else {
            setTumorType(type.charAt(0).toUpperCase() + type.slice(1));
            setConfidence(conf);
            toast.error(`Tumor Detected: ${type.toUpperCase()}`);
          }
        } else {
          setTumorType('');
          setConfidence('');
        }

        setLoading(false);
      }, 4000);

    } catch (error) {
      console.error('Error checking tumor:', error);
      setResult('Error occurred during prediction.');
      setTumorType('');
      setConfidence('');
      toast.error('Prediction Failed! ❌');
      setLoading(false);
    }
  };

  const handleAppointment = () => {
    navigate('/doctors/Neurologist');
  };

  const getSymptoms = (type) => {
    return tumorSymptoms[type.toLowerCase()] || [];
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
          {image && <p className="text-gray-600 text-sm mb-2">{image.name}</p>}
          {preview && (
            <div className="mt-4">
              <p className="text-gray-700 text-lg mb-2 font-medium">Image Preview:</p>
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="w-72 h-72 rounded-lg border-2 border-gray-200 shadow-sm"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? `Analyzing MRI Image...` : 'Check for Tumor'}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 text-center">Analysis Results</h3>
            {loading ? (
              <div className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-blue-500 font-semibold text-lg">
                  Please wait... {progress}%
                </div>
              </div>
            ) : result && !result.toLowerCase().includes('error') ? (
              tumorType ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 w-full">
                  <p className="text-red-600 text-3xl font-bold mb-2 text-center">Tumor Detected</p>
                  <p className="text-md text-gray-700 mb-1 text-center">
                    <span className="font-semibold">Type:</span> {tumorType.toUpperCase()}
                  </p>
                  <p className="text-md text-gray-700 mb-2 text-center">
                    <span className="font-semibold">Confidence:</span> {confidence}
                  </p>
                  <div className="mt-4">
                    <p className="text-md font-semibold text-red-700 mb-2 text-center">Possible Symptoms:</p>
                    <ul className="list-disc text-sm text-gray-700 pl-6">
                      {getSymptoms(tumorType).map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
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
                  <p className="text-sm text-gray-600 mt-2">Confidence: {confidence}</p>
                </div>
              )
            ) : result.toLowerCase().includes('error') ? (
              <div className="text-yellow-600 text-lg font-semibold text-center">
                ⚠️ Error occurred during prediction. Please try again.
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Upload an MRI image and click "Check for Tumor"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckTumor;
