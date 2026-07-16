import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { FaCamera, FaTrash, FaSave, FaTimes, FaUserEdit, FaIdBadge, FaEnvelope, FaUser } from "react-icons/fa";

import { ErrorSuccessMsg, ProfileInfoCard } from "..";
import { COLORS } from "../../constants/theme";
import { useNavigate } from "react-router-dom";

function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();

    const defaultImage =
        "https://ui-avatars.com/api/?name=User&background=e2e8f0&color=475569&size=256";

    const initialImage = userData?.profileImage
        ? `https://localhost:8000/${userData.profileImage}`
        : defaultImage;

    const [previewImage, setPreviewImage] = useState(initialImage);
    const [originalImage, setOriginalImage] = useState(initialImage);
    const [imageFile, setImageFile] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const startEditing = () => {
        setOriginalImage(previewImage);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setPreviewImage(originalImage);
        setErrorMsg('');
        setImageFile(null);
        setIsEditing(false);
    };

    const saveImage = async () => {
        if (!imageFile) {
            setErrorMsg("Please select an image.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("profileImage", imageFile);

            const res = await axios.patch(
                `/user/profile/${userData.facultyId}`,
                formData
            );

            setSuccessMsg(res.data.message);
            setOriginalImage(previewImage);
            setIsEditing(false);
        } catch (error) {
            setErrorMsg(error?.response?.data?.message);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const res = await axios.delete(
                `/user/image/${userData.facultyId}`
            );

            setSuccessMsg(res.data.message);

            setPreviewImage(defaultImage);
            setOriginalImage(defaultImage);
            setImageFile(null);
            setIsEditing(false);
        } catch (error) {
            setErrorMsg(error?.response?.data?.message);
        }
    };

    return (
        <div className="flex justify-center p-6">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-md">

                {/* Header */}

                <div
                    className="px-6 py-5"
                    style={{
                        backgroundColor: COLORS.mint,
                        color: COLORS.font
                    }}
                >
                    <h1 className="text-2xl font-bold">
                        My Profile
                    </h1>

                    <p className="text-sm opacity-90">
                        Manage your profile picture
                    </p>
                </div>

                <div className="p-8">

                    {/* Profile Image */}

                    <div className="flex flex-col items-center">

                        <label
                            htmlFor="profileImage"
                            className={`${isEditing ? "cursor-pointer group" : ""} relative`}
                        >
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="h-36 w-36 rounded-full border-4 border-slate-200 object-cover shadow-md"
                                onError={(e) => {
                                    e.target.src = defaultImage;
                                }}
                            />

                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                                    <FaCamera className="text-3xl text-white" />
                                </div>
                            )}
                        </label>

                        {isEditing && (
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        )}

                        <h2 className="mt-4 text-2xl font-bold text-slate-800">
                            {userData.name}
                        </h2>

                        <span className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">
                            {userData.role}
                        </span>
                    </div>

                    {/* Information */}

                    <div className="mt-8 grid gap-4 md:grid-cols-2">

                        <ProfileInfoCard
                            icon={<FaIdBadge />}
                            title="Faculty ID"
                            value={userData.facultyId}
                        />

                        <ProfileInfoCard
                            icon={<FaUser />}
                            title="Name"
                            value={userData.name}
                        />

                        <ProfileInfoCard
                            icon={<FaEnvelope />}
                            title="Email"
                            value={userData.email}
                        />

                        <ProfileInfoCard
                            icon={<FaUser />}
                            title="Role"
                            value={userData.role}
                        />

                    </div>

                    <div className="mt-4">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                        />
                    </div>

                    {/* Buttons */}

                    <div className="mt-8 flex flex-wrap justify-center gap-3">

                        {!isEditing ? (
                            <button
                                onClick={startEditing}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font
                                }}
                            >
                                <FaUserEdit />
                                Update Picture
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={saveImage}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700"
                                >
                                    <FaSave />
                                    Save
                                </button>

                                <button
                                    onClick={handleCancel}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-100"
                                >
                                    <FaTimes />
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteImage}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                                >
                                    <FaTrash />
                                    Remove
                                </button>
                            </>
                        )}
                        <button
                            className="bg-gray-300 p-2 rounded-lg cursor-pointer font-bold"
                            onClick={() => navigate('/change-password')}
                        >
                            change password
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;

















// import axios from "axios";
// import { useState } from "react";
// import { FaUserEdit, FaSave, FaCamera, FaTrash, } from "react-icons/fa";
// import { useSelector } from 'react-redux'
// import { ErrorSuccessMsg } from '../Components/index';
// import { COLORS } from "../constants/theme";

// function Profile() {
//     const userData = useSelector((state) => state.auth.userData);
//     const [isEditing, setIsEditing] = useState(false);
//     const [previewImage, setPreviewImage] = useState(`http://localhost:8000/${userData?.profileImage}`);
//     const [imageFile, setImageFile] = useState(null);
//     const [errorMsg, setErrorMsg] = useState('');
//     const [successMsg, setSuccessMsg] = useState('');

//     const handleImageUpload = (e) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setImageFile(file);
//             setPreviewImage(URL.createObjectURL(file));
//         }
//     };

//     const saveImage = async () => {
//         if (!imageFile) {
//             setErrorMsg("No image selected");
//             return;
//         }
//         try {
//             setErrorMsg('');
//             const formData = new FormData();
//             formData.append("profileImage", imageFile);

//             const res = await axios.patch(`/user/profile/${userData.facultyId}`,
//                 formData
//             );
//             setSuccessMsg(res.data.message);
//         } catch (error) {
//             setErrorMsg(error?.response?.data?.message);
//             console.log('ERROR || Profile | saveImage(): ', error);
//         } finally {
//             setIsEditing(false);
//             setErrorMsg('');
//         }
//     };

//     const handleDeleteImage = async () => {
//         try {
//             const res = await axios.delete(`/user/image/${userData.facultyId}`);
//             setSuccessMsg(res.data.message);
//         } catch (error) {
//             setErrorMsg(error?.response?.data?.message);
//             console.log('ERROR || Profile | deleteImage(): ', error);
//         } finally {
//             setIsEditing(false);
//             setImageFile(null);
//             getProfileImage();
//         }
//     }

//     const getProfileImage = async () => {
//         try {
//             const res = await axios.get(`/user/profile/${userData.facultyId}`);
//             setPreviewImage(`http://localhost:8000/${res.data.data.profileImage}`);
//         } catch (error) {
//             console.log(error?.response);
//             console.log('ERROR || Profile | getProfileImage(): ', error);
//         }
//     }

//     return (
//         <div className="min-h-full bg-slate-50 p-2">
//             <div className="mx-auto max-w-2xl">
//                 <div className="rounded-2xl bg-white p-6 shadow-sm">
//                     {/* Profile Image */}
//                     <div className="flex flex-col items-center">
//                         <div className="relative">
//                             <img
//                                 src={previewImage}
//                                 alt="Profile"
//                                 className="h-22 w-22 rounded-full border-4 border-slate-100 object-cover"
//                                 onError={(e) => {
//                                     e.target.src =
//                                         "https://ui-avatars.com/api/?name=User&background=random";
//                                 }}
//                             />

//                             {isEditing && (
//                                 <>
//                                     <label
//                                         htmlFor="profile-upload"
//                                         className="absolute bottom-1 right-1 cursor-pointer rounded-full p-3 shadow-lg transition"
//                                         style={{
//                                             backgroundColor: COLORS.mint,
//                                             color: COLORS.font
//                                         }}
//                                     >
//                                         <FaCamera />
//                                     </label>

//                                     <input
//                                         id="profile-upload"
//                                         type="file"
//                                         accept="image/*"
//                                         className="hidden"
//                                         onChange={handleImageUpload}
//                                     />
//                                 </>
//                             )}
//                         </div>

//                         <h1 className="mt-4 text-2xl font-bold text-slate-900">
//                             {userData.name}
//                         </h1>

//                         <span className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">
//                             {userData.role}
//                         </span>
//                     </div>

//                     {/* Form */}
//                     <div className="mt-5 mb-1 space-y-5">
//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-slate-700">
//                                 Faculty ID
//                             </label>
//                             <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
//                                 {userData.facultyId}
//                             </p>
//                         </div>

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-slate-700">
//                                 Name
//                             </label>
//                             <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
//                                 {userData.name}
//                             </p>
//                         </div>

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-slate-700">
//                                 Email
//                             </label>
//                             <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
//                                 {userData.email}
//                             </p>
//                         </div>
//                     </div>

//                     <ErrorSuccessMsg
//                         errorMsg={errorMsg}
//                         successMsg={successMsg}
//                         setSuccessMsg={setSuccessMsg}
//                     />

//                     {/* Buttons */}
//                     <div className="mt-5 flex flex-wrap gap-3">
//                         {!isEditing ? (
//                             <button
//                                 onClick={() => setIsEditing(true)}
//                                 className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
//                             >
//                                 <FaUserEdit />
//                                 Update Profile Picture
//                             </button>
//                         ) : (
//                             <>
//                                 <button
//                                     onClick={saveImage}
//                                     className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
//                                 >
//                                     <FaSave />
//                                     Save Image
//                                 </button>
//                                 {userData?.profileImage && (
//                                     <button
//                                         onClick={handleDeleteImage}
//                                         className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
//                                     >
//                                         <FaTrash />
//                                         Delete Profile Picture
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Profile
