import React from 'react'

function ContactUs() {
    const contacts = [
        {
            name: "Bikram Das",
            email: "bikramdas736136@gmail.com",
            linkedin: "https://www.linkedin.com/in/bikram-das/",
            github: "https://github.com/Bikram-57"
        },
        {
            name: "Soumyadip Chowdhury",
            email: "soumyadip2110@gmail.com",
            linkedin: "https://www.linkedin.com/in/soumyadip-chowdhury2110/",
            github: "https://github.com/soumyadip2110"
        }
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center px-6 py-12">
            <h1 className="text-4xl font-bold text-white mb-10">
                Contact Us
            </h1>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {contacts.map((person, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 transition duration-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                                {person.name.charAt(0)}
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                {person.name}
                            </h2>

                            <div className="flex flex-col gap-3 w-full">
                                <a
                                    href={`mailto:${person.email}`}
                                    className="bg-gray-100 hover:bg-indigo-100 text-gray-700 py-2 rounded-lg transition"
                                >
                                    📧 Email
                                </a>

                                <a
                                    href={person.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 rounded-lg transition"
                                >
                                    💼 LinkedIn
                                </a>

                                <a
                                    href={person.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
                                >
                                    🐙 GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ContactUs