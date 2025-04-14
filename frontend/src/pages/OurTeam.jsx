import { useEffect } from "react";
import { assets } from "../assets/assets_frontend/assets";

const teamMembers = [
  {
    name: "Dinesh Bhatt",
    role: "",
    image: assets.dinesh,
    social: ["facebook", "twitter", "instagram"],
    statement: "Ensuring SwasthyaSewa is reliable, secure, and bug-free is my top priority, making sure patients have a seamless experience."
  },
  {
    name: "Neelam Dhami",
    role: "",
    image: assets.neelam,
    social: ["facebook", "twitter", "instagram"],
    statement: "I focus on building an intuitive interface, allowing users to navigate effortlessly while booking appointments and checking reports."
  },
  {
    name: "Shreya Joshi",
    role: "",
    image: assets.shreya,
    social: ["facebook", "twitter", "instagram"],
    statement: "My goal is to design an engaging and user-friendly platform that ensures accessibility and ease for all users."
  },
  {
    name: "Umesh Bhatt",
    role: "CEO",
    image: assets.umesh,
    social: ["facebook", "twitter", "instagram"],
    statement: "Developing SwasthyaSewa has been a fulfilling journey, integrating AI for MRI scans and real-time doctor consultations."
  },
];

export default function TeamSection() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page when the component is mounted
  }, []);

  return (
    <div className="bg-gray-100 py-12 px-6 text-center">
      <h2 className="text-3xl font-bold text-orange-500 mb-8">Meet Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-md">
            <img
              src={member.image}
              alt={member.name}
              className="w-24 h-24 mx-auto rounded-full border-4 border-orange-300"
            />
            <h3 className="text-xl font-semibold mt-4">{member.name}</h3>

            <p className="text-gray-600 mt-2 text-sm">
              {member.statement}
            </p>

            <p className="mt-3 font-bold text-gray-700">{member.role}</p>
            <div className="flex justify-center gap-3 mt-4">
              {member.social.map((platform, i) => (
                <a key={i} href="#" className="text-gray-600 hover:text-orange-500 text-lg">
                  <i className={`fab fa-${platform}`}></i>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
