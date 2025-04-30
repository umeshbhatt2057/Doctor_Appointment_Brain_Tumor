import React from 'react';

const ApplyDoctor = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg mt-12 text-center border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-4 text-blue-800 tracking-tight">
        Become a Doctor at Swasthya Sewa
      </h2>
      <p className="mb-6 text-gray-700 text-lg">
        We are always looking for dedicated medical professionals to join our team.
      </p>
      <div className="mb-6 text-gray-700 text-base bg-blue-100 rounded-lg p-4">
        <span className="font-semibold text-blue-700 text-lg">
          To apply:
        </span>
        <br />
        Please email your <span className="font-semibold">updated CV</span> and <span className="font-semibold">credentials</span> to our recruitment team at:
        <br />
        <span className="font-bold text-blue-600 text-lg select-all">umeshbhatt2057@gmail.com</span>
      </div>
      <p className="mb-6 text-gray-700">
        Our recruitment team will review your application and contact you promptly if your qualifications meet our requirements.
        <br />
        <br />
        For faster processing, <span className="font-semibold text-blue-700">please include your contact number</span> in your email so our team can reach you directly.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-left text-base text-blue-900 mb-6 shadow-sm">
        <strong className="block mb-2 text-blue-700">Application Tips:</strong>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Use a clear subject line, e.g., <span className="italic">Application for Doctor Position – [Your Name]</span>
          </li>
          <li>
            Attach your updated CV and scanned copies of your medical degrees and certifications.
          </li>
          <li>
            Include a brief cover letter introducing yourself, your specialty, and your years of experience.
          </li>
          <li>
            <span className="font-semibold">Add your phone number</span> to ensure our team can contact you quickly.
          </li>
        </ul>
      </div>
      <div className="text-gray-600 text-sm">
        For any queries, you may also email us at <span className="text-blue-600 font-medium">umeshbhatt2057@gmail.com</span>.
        <br />
        <span className="font-semibold">We look forward to connecting with you!</span>
      </div>
    </div>
  );
};

export default ApplyDoctor;
