import axios from "axios";
import { useState } from "react";
import {
    FaUserEdit,
    FaSave,
    FaCamera,
    FaTrash,
} from "react-icons/fa";
import { useSelector } from 'react-redux'

function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(`http://localhost:8000/${userData?.profileImage}`);
    const [imageFile, setImageFile] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const saveImage = async () => {
        try {
            if (!imageFile) {
                console.log("No image selected");
                return;
            }

            const formData = new FormData();
            formData.append("profileImage", imageFile);

            const res = await axios.patch(`/user/profile/${userData.facultyId}`,
                formData
            );
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || Profile | saveImage(): ', error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const res = await axios.delete(`/user/image/${userData.facultyId}`);
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || Profile | deleteImage(): ', error);
        } finally {
            setIsEditing(false);
            setImageFile(null);
            // setPreviewImage();
            getProfileImage();
        }
    }
    
    const getProfileImage = async () => {
        try {
            const res = await axios.get(`/user/profile${userData.facultyId}`);
            console.log(res.data);
        } catch (error) {
            console.log(error?.response);
            console.log('ERROR || Profile | getProfileImage(): ', error);
        }
    }

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
                            {userData.name}
                        </h1>

                        <span className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">
                            {userData.role}
                        </span>
                    </div>

                    {/* Form */}
                    <div className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Faculty ID
                            </label>
                            <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
                                {userData.facultyId}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
                                {userData.name}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <p className="w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-500">
                                {userData.email}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
                            >
                                <FaUserEdit />
                                Update Profile Picture
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={saveImage}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                                >
                                    <FaSave />
                                    Save Image
                                </button>
                                {userData?.profileImage && (
                                    <button
                                        onClick={handleDeleteImage}
                                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
                                    >
                                        <FaTrash />
                                        Delete Profile Picture
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile
