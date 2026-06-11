import { useState } from "react";
import {
    FaUserEdit,
    FaSave,
    FaSignOutAlt,
    FaCamera,
} from "react-icons/fa";

export default function Profile() {
    const profileData = {
        _id: "69d2a1e6ef143011a42c7284",
        facultyId: "7211",
        name: "Mr. Gaurav Pradhan",
        email: "gaurav.p@smit.smu.edu.in",
        role: "faculty",
        profileImage: "/images/profilePlaceholder.jpg",
    };

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        facultyId: profileData.facultyId,
        name: profileData.name,
        email: profileData.email,
    });

    const [previewImage, setPreviewImage] = useState(
        profileData.profileImage ||
        "https://ui-avatars.com/api/?name=User&background=random"
    );

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        console.log("Save Data:", formData);

        // call update profile API here

        setIsEditing(false);
    };

    const handleLogout = () => {
        console.log("Logout");
        // dispatch(logout())
        // navigate("/login")
    };

    return (
        <div className="min-h-full bg-slate-50 m-2">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="h-22 w-22 rounded-full border-4 border-slate-100 object-cover"
                                onError={(e) => {
                                    e.target.src =
                                        "https://ui-avatars.com/api/?name=User&background=random";
                                }}
                            />

                            {isEditing && (
                                <>
                                    <label
                                        htmlFor="profile-upload"
                                        className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-blue-600 p-3 text-white shadow-lg transition hover:bg-blue-700"
                                    >
                                        <FaCamera />
                                    </label>

                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </>
                            )}
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-slate-900">
                            {formData.name}
                        </h1>

                        <span className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">
                            {profileData.role}
                        </span>
                    </div>

                    {/* Form */}
                    <div className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Faculty ID
                            </label>
                            <input
                                type="text"
                                name="facultyId"
                                value={formData.facultyId}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                            >
                                <FaUserEdit />
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                            >
                                <FaSave />
                                Save Changes
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



// import { useRef, useState } from "react";
// import {
//     FaUserEdit,
//     FaSave,
//     FaSignOutAlt,
//     FaCamera,
// } from "react-icons/fa";

// export default function Profile() {
//     const [isEditing, setIsEditing] = useState(false);

//     const [user, setUser] = useState({
//         name: "John Doe",
//         facultyId: "FAC-2024-001",
//         email: "john.doe@example.com",
//         profilePicture: "https://i.pravatar.cc/300",
//     });

//     const fileInputRef = useRef(null);

//     const handleChange = (e) => {
//         setUser((prev) => ({
//             ...prev,
//             [e.target.name]: e.target.value,
//         }));
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files?.[0];

//         if (file) {
//             const imageUrl = URL.createObjectURL(file);

//             setUser((prev) => ({
//                 ...prev,
//                 profilePicture: imageUrl,
//             }));
//         }
//     };

//     const handleEditSave = () => {
//         if (isEditing) {
//             // API call to save profile
//             console.log("Saving profile...", user);
//         }

//         setIsEditing(!isEditing);
//     };

//     const handleLogout = () => {
//         // logout logic
//         console.log("Logging out...");
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 p-6">
//             <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
//                 {/* Profile Picture */}
//                 <div className="flex flex-col items-center">
//                     <div className="relative">
//                         <img
//                             src={user.profilePicture}
//                             alt={user.name}
//                             className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-100"
//                         />

//                         {isEditing && (
//                             <button
//                                 onClick={() => fileInputRef.current?.click()}
//                                 className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-3 text-white shadow-md transition hover:bg-blue-700"
//                             >
//                                 <FaCamera />
//                             </button>
//                         )}

//                         <input
//                             ref={fileInputRef}
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={handleImageUpload}
//                         />
//                     </div>

//                     <h1 className="mt-4 text-2xl font-bold text-slate-900">
//                         Profile
//                     </h1>
//                 </div>

//                 {/* Form */}
//                 <div className="mt-8 space-y-5">
//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-slate-600">
//                             Full Name
//                         </label>
//                         <input
//                             type="text"
//                             name="name"
//                             value={user.name}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>

//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-slate-600">
//                             Faculty ID
//                         </label>
//                         <input
//                             type="text"
//                             name="facultyId"
//                             value={user.facultyId}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>

//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-slate-600">
//                             Email
//                         </label>
//                         <input
//                             type="email"
//                             name="email"
//                             value={user.email}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//                     <button
//                         onClick={handleEditSave}
//                         className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
//                     >
//                         {isEditing ? <FaSave /> : <FaUserEdit />}
//                         {isEditing ? "Save Changes" : "Edit Profile"}
//                     </button>

//                     <button
//                         onClick={handleLogout}
//                         className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
//                     >
//                         <FaSignOutAlt />
//                         Logout
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }



// import { useState } from "react";
// import {
//     FaUserEdit,
//     FaSave,
//     FaEnvelope,
//     FaIdCard,
//     FaCamera,
// } from "react-icons/fa";

// export default function Profile() {
//     const [isEditing, setIsEditing] = useState(false);

//     const [profile, setProfile] = useState({
//         name: "John Doe",
//         facultyId: "FAC-2024-001",
//         email: "john.doe@example.com",
//         profilePicture: "https://i.pravatar.cc/300",
//     });

//     const handleChange = (e) => {
//         setProfile({
//             ...profile,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files?.[0];

//         if (file) {
//             const imageUrl = URL.createObjectURL(file);

//             setProfile((prev) => ({
//                 ...prev,
//                 profilePicture: imageUrl,
//             }));
//         }
//     };

//     const handleSave = () => {
//         // Call API here

//         console.log(profile);
//         setIsEditing(false);
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 p-6">
//             <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
//                 {/* Profile Picture */}
//                 <div className="flex flex-col items-center">
//                     <div className="relative">
//                         <img
//                             src={profile.profilePicture}
//                             alt="Profile"
//                             className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-100"
//                         />

//                         {isEditing && (
//                             <>
//                                 <label
//                                     htmlFor="profile-upload"
//                                     className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-3 text-white shadow-lg transition hover:bg-blue-700"
//                                 >
//                                     <FaCamera size={14} />
//                                 </label>

//                                 <input
//                                     id="profile-upload"
//                                     type="file"
//                                     accept="image/*"
//                                     className="hidden"
//                                     onChange={handleImageUpload}
//                                 />
//                             </>
//                         )}
//                     </div>

//                     <h2 className="mt-4 text-xl font-semibold text-slate-900">
//                         Faculty Profile
//                     </h2>
//                 </div>

//                 {/* Form */}
//                 <div className="mt-8 space-y-5">
//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-slate-600">
//                             Name
//                         </label>

//                         <input
//                             type="text"
//                             name="name"
//                             value={profile.name}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>

//                     <div>
//                         <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
//                             <FaIdCard />
//                             Faculty ID
//                         </label>

//                         <input
//                             type="text"
//                             name="facultyId"
//                             value={profile.facultyId}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>

//                     <div>
//                         <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
//                             <FaEnvelope />
//                             Email
//                         </label>

//                         <input
//                             type="email"
//                             name="email"
//                             value={profile.email}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
//                         />
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="mt-8">
//                     {!isEditing ? (
//                         <button
//                             onClick={() => setIsEditing(true)}
//                             className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
//                         >
//                             <FaUserEdit />
//                             Edit Profile
//                         </button>
//                     ) : (
//                         <button
//                             onClick={handleSave}
//                             className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
//                         >
//                             <FaSave />
//                             Save Changes
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }



// import React from 'react'
// import { IoMdMail } from "react-icons/io";
// import { FaIdCard } from "react-icons/fa";
// function Profile() {
//     const user = {
//         name: "John Doe",
//         facultyId: "FAC-2024-001",
//         email: "john.doe@example.com",
//         profilePicture: "https://i.pravatar.cc/300",
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 p-6">
//             <div className="mx-auto max-w-2xl">
//                 <div className="rounded-2xl bg-white p-8 shadow-sm">
//                     <div className="flex flex-col items-center">
//                         <img
//                             src={user.profilePicture}
//                             alt={user.name}
//                             className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-100"
//                         />

//                         <h1 className="mt-4 text-2xl font-bold text-slate-900">
//                             {user.name}
//                         </h1>
//                     </div>

//                     <div className="mt-8 space-y-4">
//                         <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
//                             <FaIdCard className="h-5 w-5 text-slate-500" />
//                             <div>
//                                 <p className="text-sm text-slate-500">Faculty ID</p>
//                                 <p className="font-medium text-slate-900">
//                                     {user.facultyId}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
//                             {/* <Mail className="h-5 w-5 text-slate-500" /> */}
//                             <IoMdMail className="h-5 w-5 text-slate-500" />
//                             <div>
//                                 <p className="text-sm text-slate-500">Email</p>
//                                 <p className="font-medium text-slate-900">
//                                     {user.email}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     <button className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700">
//                         Edit Profile
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Profile