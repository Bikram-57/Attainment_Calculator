import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";

function AddMultipleSubjectsForm({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [isHovered, setIsHovered] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleAddMultipleSubjects = async () => {
        if (!file) {
            setErrorMsg("Please choose a file!");
            return;
        }
        setErrorMsg('');
        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const res = await axios.post('/uploadAll/', formData);
            setSuccessMsg(res.data.message);
            toggleUpdate();
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || AddMultipleSubjectsForm || handleAddMultipleSubjects(): ', error);
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
            setErrorMsg('Only Excel files (.xls, .xlsx) are allowed');
            setFile(null);
            return;
        }

        setErrorMsg('');
        setFile(selectedFile);
    }

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
    }

    if (!isAddSubjectOpen) return null;

    return (
        <div>
            {/* Body */}
            <div className="py-3 space-y-2">
                {/* Subject Code */}
                <div
                    className='flex border-2 border-gray-300 rounded-sm'
                    style={{ backgroundColor: COLORS.font }}
                >
                    <label
                        className='border-gray-300 px-3 py-1 border-r-2 cursor-pointer'
                        style={{ backgroundColor: COLORS.latteDark }}
                    >
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
                        className='w-2/3 px-2 py-1'
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
                        onClick={() => setIsAddSubjectOpen(false)}
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
                        onClick={handleAddMultipleSubjects}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        Add
                    </button>
                </div>

                {/* Divider */}
                <ErrorSuccessMsg
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                    setSuccessMsg={setSuccessMsg}
                    setIsOpen={setIsAddSubjectOpen}
                />
            </div>
        </div>
    );
}

export default AddMultipleSubjectsForm