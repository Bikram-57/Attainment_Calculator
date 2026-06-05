import React from 'react'
import { MdOutlineMail } from "react-icons/md";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

function ContactUs() {
    const contacts = [
        {
            name: "Bikram Das",
            role: "Backend Developer",
            email: "bikramdas20032@gmail.com",
            linkedin: "https://www.linkedin.com/in/bikram-das-3b15712b4?utm_source=share_via&utm_content=profile&utm_medium=member_android",
            github: "https://github.com/Bikram-57"
        },
        {
            name: "Soumyadip Chowdhury",
            role: "Frontend Developer",
            email: "soumyadip2110@gmail.com",
            linkedin: "https://www.linkedin.com/in/soumyadip-chowdhury2110/",
            github: "https://github.com/soumyadip2110"
        }
    ]

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-6 py-12">
            {/* Background Glow */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 w-full max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white">
                        Meet The Team
                    </h1>
                    <p className="text-gray-400 mt-3">
                        Feel free to reach out to us anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {contacts.map((person, index) => (
                        <div
                            key={index}
                            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 hover:border-cyan-400 transition-all duration-300"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                                    {person.name
                                        .split(" ")
                                        .map(word => word[0])
                                        .join("")}
                                </div>

                                <div>
                                    <h2 className="text-2xl font-semibold text-white">
                                        {person.name}
                                    </h2>
                                    <p className="text-gray-400">
                                        {person.role}
                                    </p>
                                    {/* <p className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                        {person.role}
                                    </p> */}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 flex-wrap">
                                <a
                                    href={`mailto:${person.email}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                                >
                                    <MdOutlineMail className='h-6 w-6' />
                                    Email
                                </a>

                                <a
                                    href={person.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                                >
                                    <FaLinkedin className='h-6 w-6' />
                                    LinkedIn
                                </a>

                                <a
                                    href={person.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 transition"
                                >
                                    <FaGithub className='h-6 w-6' />
                                    GitHub
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>





        // <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center px-6 py-12">
        //     <h1 className="text-4xl font-bold text-white mb-10">
        //         Contact Us
        //     </h1>

        //     <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        //         {contacts.map((person, index) => (
        //             <div
        //                 key={index}
        //                 className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 transition duration-300"
        //             >
        //                 <div className="flex flex-col items-center text-center">
        //                     <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
        //                         {person.name.charAt(0)}
        //                     </div>

        //                     <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        //                         {person.name}
        //                     </h2>

        //                     <div className="flex flex-col gap-3 w-full">
        //                         <a
        //                             href={`mailto:${person.email}`}
        //                             className="bg-gray-100 hover:bg-indigo-100 text-gray-700 py-2 rounded-lg transition"
        //                         >
        //                             📧 Email
        //                         </a>

        //                         <a
        //                             href={person.linkedin}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 rounded-lg transition"
        //                         >
        //                             💼 LinkedIn
        //                         </a>

        //                         <a
        //                             href={person.github}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
        //                         >
        //                             🐙 GitHub
        //                         </a>
        //                     </div>
        //                 </div>
        //             </div>
        //         ))}
        //     </div>
        // </div>





        // <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center px-6 py-12">

        //     {/* Background Blobs */}
        //     <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"></div>
        //     <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl"></div>

        //     <h1 className="text-5xl font-extrabold text-white mb-12 z-10">
        //         Get In Touch
        //     </h1>

        //     <div className="grid md:grid-cols-2 gap-10 w-full max-w-5xl z-10">
        //         {contacts.map((person, index) => (
        //             <div
        //                 key={index}
        //                 className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:-translate-y-2 transition-all duration-300"
        //             >
        //                 <div className="flex flex-col items-center">

        //                     {/* Avatar */}
        //                     <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
        //                         {person.name.charAt(0)}
        //                     </div>

        //                     <h2 className="mt-5 text-2xl font-bold text-white">
        //                         {person.name}
        //                     </h2>

        //                     <p className="text-gray-300 text-sm mt-1">
        //                         Team Member
        //                     </p>

        //                     <div className="w-full mt-8 space-y-3">
        //                         <a
        //                             href={`mailto:${person.email}`}
        //                             className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition"
        //                         >
        //                             📧 Email
        //                         </a>

        //                         <a
        //                             href={person.linkedin}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-white py-3 rounded-xl transition"
        //                         >
        //                             💼 LinkedIn
        //                         </a>

        //                         <a
        //                             href={person.github}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="flex items-center justify-center gap-2 bg-gray-500/20 hover:bg-gray-500/30 text-white py-3 rounded-xl transition"
        //                         >
        //                             🐙 GitHub
        //                         </a>
        //                     </div>
        //                 </div>
        //             </div>
        //         ))}
        //     </div>
        // </div>





        // <div
        //     className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        //     style={{ backgroundColor: '#fffaf3' }}
        // >
        //     <h1
        //         className="text-5xl font-bold mb-4 text-center"
        //         style={{ color: '#008985' }}
        //     >
        //         Contact Us
        //     </h1>

        //     <p
        //         className="text-center mb-12 max-w-xl"
        //         style={{ color: '#008985' }}
        //     >
        //         Have questions or want to connect with us? Reach out through any of
        //         the platforms below.
        //     </p>

        //     <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        //         {contacts.map((person, index) => (
        //             <div
        //                 key={index}
        //                 className="rounded-3xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        //                 style={{
        //                     backgroundColor: '#ffffff',
        //                     border: '2px solid #e4ddd3',
        //                 }}
        //             >
        //                 <div className="flex flex-col items-center text-center">

        //                     {/* Avatar */}
        //                     <div
        //                         className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-5"
        //                         style={{
        //                             backgroundColor: '#00A19B',
        //                             color: '#ffffff',
        //                         }}
        //                     >
        //                         {person.name
        //                             .split(' ')
        //                             .map(word => word[0])
        //                             .join('')
        //                             .slice(0, 2)}
        //                     </div>

        //                     <h2
        //                         className="text-2xl font-bold mb-2"
        //                         style={{ color: '#008985' }}
        //                     >
        //                         {person.name}
        //                     </h2>

        //                     <div className="w-16 h-1 rounded-full mb-6"
        //                         style={{ backgroundColor: '#00A19B' }}
        //                     />

        //                     <div className="flex flex-col gap-3 w-full">

        //                         <a
        //                             href={`mailto:${person.email}`}
        //                             className="py-3 rounded-xl font-medium transition-all duration-300"
        //                             style={{
        //                                 backgroundColor: '#00A19B',
        //                                 color: '#ffffff',
        //                             }}
        //                             onMouseEnter={(e) =>
        //                                 (e.currentTarget.style.backgroundColor = '#008985')
        //                             }
        //                             onMouseLeave={(e) =>
        //                                 (e.currentTarget.style.backgroundColor = '#00A19B')
        //                             }
        //                         >
        //                             📧 Email
        //                         </a>

        //                         <a
        //                             href={person.linkedin}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="py-3 rounded-xl font-medium border-2 transition-all duration-300"
        //                             style={{
        //                                 borderColor: '#00A19B',
        //                                 color: '#008985',
        //                             }}
        //                         >
        //                             💼 LinkedIn
        //                         </a>

        //                         <a
        //                             href={person.github}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="py-3 rounded-xl font-medium border-2 transition-all duration-300"
        //                             style={{
        //                                 borderColor: '#00A19B',
        //                                 color: '#008985',
        //                             }}
        //                         >
        //                             🐙 GitHub
        //                         </a>
        //                     </div>
        //                 </div>
        //             </div>
        //         ))}
        //     </div>
        // </div>






    )
}

export default ContactUs