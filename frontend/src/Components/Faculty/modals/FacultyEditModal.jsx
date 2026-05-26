import React from 'react'

function FacultyEditModal({
    // isOpen,
    onClose,
    faculty,
    onUpdate,
}) {
    // if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-3xl font-semibold text-blue-700">
                        Faculty Details
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={32} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">

                    {/* Faculty ID */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">
                            Faculty Id
                        </label>
                        <input
                            type="text"
                            value={faculty.id}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={faculty.name}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-lg text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={faculty.email}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-gray-50 outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex justify-end">
                    <button
                        onClick={onUpdate}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-lg font-medium shadow"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};


export default FacultyEditModal