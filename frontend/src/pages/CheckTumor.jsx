import React, { useState } from 'react';
import axios from 'axios';

const CheckTumor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult('');
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
      alert('Please select an MRI image.');
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
      setResult(res.data.result || 'No result returned');
    } catch (error) {
      console.error('Error checking tumor:', error);
      setResult('Error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Brain Tumor Detection</h2>
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
            <img src={preview} alt="MRI Preview" className="w-full h-auto rounded border" />
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
        <div className="mt-6 text-center">
          <h3 className="text-lg font-bold">Result:</h3>
          <p className="text-gray-800 mt-1">{result}</p>
        </div>
      )}
    </div>
  );
};

export default CheckTumor;
