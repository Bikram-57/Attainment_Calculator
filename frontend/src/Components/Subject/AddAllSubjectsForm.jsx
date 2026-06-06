import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { COLORS } from '../../constants/theme'

function AddAllSubjectsForm({ isAddAllSubjectOpen, setIsAddAllSubjectOpen, toggleUpdate }) {
    const [subjectId, setSubjectId] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [course, setCourse] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!successMsg) return;
        const timer = setTimeout(() => {
            setSuccessMsg("");
            setIsAddAllSubjectOpen(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [successMsg])

    const handleAddAllSubjects = async () => {
        if (!file) {
            setError("Please choose a file!");
            return;
        }

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const res = await axios.post('/uploadAll/', formData);
            setSuccessMsg(res.data.message);
            toggleUpdate();
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || AddAllSubjectsForm || handleAddAllSubjects(): ', error);
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        const validTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        ];

        if (!selectedFile) return;
        if (!validTypes.includes(selectedFile.type)) {
            setError('Only Excel files (.xls, .xlsx) are allowed');
            setFile(null);
            return;
        }

        setError('');
        setFile(selectedFile);
    }

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
    }

    if (!isAddAllSubjectOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Add All Subjects
                    </h2>

                    <button
                        onClick={() => setIsAddAllSubjectOpen(false)}
                        className="cursor-pointer"
                    >
                        <IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-3 space-y-2">

                    {/* Subject Code */}
                    <div
                        className='flex w-3/5 border-2 border-gray-300 rounded-sm'
                        style={{ backgroundColor: COLORS.font }}
                    >
                        <label className='bg-gray-200 border-gray-300 px-3 border-r-2 cursor-pointer'>
                            Choose File
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='.xls, .xlsx'
                                className='hidden'
                                onChange={handleFileChange}
                            />
                        </label>
                        <div
                            className='w-2/3 mx-2'
                            style={{ backgroundColor: COLORS.font }}
                        >
                            {!file ? 'No file choose' : file.name}
                        </div>
                        {file && (
                            <div
                                className='ml-auto mr-2'
                                onClick={handleRemoveFile}
                            >
                                <MdOutlineCancelPresentation className='h-full w-6.25 cursor-pointer text-red-600' />
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsAddAllSubjectOpen(false)}
                            className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
                            style={{ color: COLORS.font }}
                        >
                            Close
                        </button>

                        <button
                            className="hover:bg-blue-900 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
                            style={{
                                color: COLORS.font,
                                backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint
                            }}
                            onClick={handleAddAllSubjects}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Add
                        </button>
                    </div>

                    {/* Divider */}
                    {/* <div className="border-t border-gray-300 pt-5">
                        <p className="text-red-500 text-md">
                            Note: Once a subject is created, Subject Code cannot be changed.
                        </p>
                    </div> */}
                    <div>
                        {error && (
                            <p className="text-red-500 text-sm ml-2">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-sm ml-2 flex">
                                <MdDone className='text-green-500 h-full w-5 mx-1 order rounded-full' />
                                {successMsg}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddAllSubjectsForm