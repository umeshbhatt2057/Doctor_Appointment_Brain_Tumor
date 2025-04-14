import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBrain, FaCheckCircle } from 'react-icons/fa';

const CheckTumor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [tumorType, setTumorType] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error('Prediction Failed! ');
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = () => {
    if (result.toLowerCase().includes('notumor')) return 'text-green-600';
    if (result.toLowerCase().includes('error')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-xl rounded-xl animate-fade-in">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
        <FaBrain className="text-blue-600" /> Brain Tumor Detection
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Upload MRI Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-base text-gray-500
                          file:mr-4 file:py-3 file:px-6
                          file:rounded-lg file:border-0
                          file:text-base file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
              />
            </div>

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
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition 
                        text-lg font-semibold shadow-md disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Check for Tumor'
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-2xl font-bold mb-4 text-center">Analysis Results</h3>
          
          {result ? (
            <div className={`mt-4 p-6 rounded-lg ${result.toLowerCase().includes('notumor') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {tumorType ? (
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getResultColor()} mb-4`}>
                    Tumor Detected
                  </p>
                  <div className="space-y-3">
                    <p className="text-xl text-gray-800">
                      <span className="font-semibold">Type:</span> {tumorType.toUpperCase()}
                    </p>
                    <p className="text-xl text-gray-800">
                      <span className="font-semibold">Confidence:</span> {confidence}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 mb-4 flex items-center justify-center gap-2">
                    <FaCheckCircle className="text-green-500" /> No Tumor Detected
                  </p>
                  <p className="text-xl text-gray-700">
                    <span className="font-semibold">Confidence:</span> {confidence}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-xl mb-2">No analysis performed yet</p>
                <p className="text-lg">Upload an MRI image and click "Check for Tumor"</p>
              </div>
            </div>
          )}

          {result.toLowerCase().includes('error') && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-lg font-semibold text-center">
                ⚠️ Error occurred during prediction. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckTumor;