import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';

const ApplyDoctor = () => {
  const form = useRef();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setSending(true);

    emailjs.sendForm('your_service_id', 'your_template_id', form.current, 'your_user_id')
      .then(() => {
        setSending(false);
        setSent(true);
        form.current.reset();
      }, (error) => {
        setSending(false);
        console.error(error.text);
      });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Doctor Application Form</h2>
      <form ref={form} onSubmit={sendEmail} className="space-y-4" encType="multipart/form-data">
        <input type="text" name="name" placeholder="Full Name" required className="w-full p-2 border rounded" />
        <input type="text" name="address" placeholder="Address" required className="w-full p-2 border rounded" />
        <input type="text" name="contact" placeholder="Contact Number" required className="w-full p-2 border rounded" />
        <input type="text" name="nmc_no" placeholder="NMC Number" required className="w-full p-2 border rounded" />
        <input type="text" name="working_hours" placeholder="Available Working Hours" className="w-full p-2 border rounded" />
        <input type="text" name="expected_fees" placeholder="Expected Fees" className="w-full p-2 border rounded" />

        <label className="block">CV (PDF)</label>
        <input type="file" name="cv" accept=".pdf" required className="w-full p-2 border rounded" />

        <label className="block">Citizenship Photo (Image)</label>
        <input type="file" name="citizenship_photo" accept="image/*" required className="w-full p-2 border rounded" />

        <label className="block">Council Certificate (PDF/Image)</label>
        <input type="file" name="council_certificate" accept=".pdf,image/*" required className="w-full p-2 border rounded" />

        <button type="submit" disabled={sending} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {sending ? 'Sending...' : 'Submit'}
        </button>

        {sent && <p className="text-green-500 mt-2">Application sent successfully!</p>}
      </form>
    </div>
  );
};

export default ApplyDoctor;
