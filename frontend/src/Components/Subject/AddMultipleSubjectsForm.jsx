import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";

function AddMultipleSubjectsForm({ isAddSubjectOpen, setIsAddSubjectOpen, toggleUpdate }) {
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDownloadFormat = async () => {
        try {
            const response = await axios.get('/download-format/subject',
                {
                    responseType: 'blob',
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'Upload_all_subjects.xlsx';

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download report.');
        }
    }

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
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to add subjects!');
            console.log('ERROR || AddMultipleSubjectsForm || handleAddMultipleSubjects(): ', err);
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
        <div className="space-y-3">

            {/* File Picker */}
            <div>
                <label
                    className="mb-2 block text-sm sm:text-md font-semibold"
                    style={{ color: COLORS.mintDark }}
                >
                    Excel File
                </label>

                <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

                    <label
                        className="cursor-pointer border-r border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition hover:bg-gray-100 whitespace-nowrap"
                        style={{
                            backgroundColor: COLORS.latteDark,
                            color: COLORS.mintDark
                        }}
                    >
                        Choose File

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xls,.xlsx"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>


                    <div className="flex-1 truncate px-3 sm:px-4 text-xs sm:text-sm text-gray-600">
                        {file ? file.name : "No file selected"}
                    </div>


                    {file && (
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="px-2 sm:px-3 text-gray-500 transition hover:text-red-700 shrink-0"
                        >
                            {/* <MdOutlineCancelPresentation className="h-5 w-5 sm:h-6 sm:w-6" /> */}
                            <IoMdClose className="h-6 w-6" />
                        </button>
                    )}

                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
                </p>

            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                <button
                    onClick={handleDownloadFormat}
                    className="w-full sm:w-auto rounded-xl border border-gray-400 bg-gray-200 px-5 py-2 text-sm font-medium transition hover:bg-gray-100 cursor-pointer"
                >
                    Download Format
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsAddSubjectOpen(false)}
                        className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleAddMultipleSubjects}
                        className="w-full sm:w-auto rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font,
                        }}
                    >
                        Upload Subjects
                    </button>

                </div>
            </div>

            <div className="order-2 sm:order-1">
                <ErrorSuccessMsg
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                    setSuccessMsg={setSuccessMsg}
                    setIsOpen={setIsAddSubjectOpen}
                />
            </div>
        </div>

        // <div className="space-y-2">

        //     {/* File Picker */}
        //     <div>
        //         <label className="mb-2 block text-md font-semibold" style={{ color: COLORS.mintDark }}>
        //             Excel File
        //         </label>

        //         <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

        //             <label
        //                 className="cursor-pointer border-r border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        //                 style={{ backgroundColor: COLORS.latteDark, color: COLORS.mintDark }}
        //             >
        //                 Choose File

        //                 <input
        //                     ref={fileInputRef}
        //                     type="file"
        //                     accept=".xls,.xlsx"
        //                     className="hidden"
        //                     onChange={handleFileChange}
        //                 />
        //             </label>

        //             <div className="flex-1 truncate px-4 text-sm text-gray-600">
        //                 {file ? file.name : "No file selected"}
        //             </div>

        //             {file && (
        //                 <button
        //                     type="button"
        //                     onClick={handleRemoveFile}
        //                     className="px-3 text-red-500 transition hover:text-red-700"
        //                 >
        //                     <MdOutlineCancelPresentation className="h-6 w-6" />
        //                 </button>
        //             )}

        //         </div>

        //         <p className="mt-2 text-xs text-gray-500">
        //             Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
        //         </p>
        //     </div>

        //     {/* Buttons */}
        //     <div className="flex justify-between items-center">
        //         <ErrorSuccessMsg
        //             errorMsg={errorMsg}
        //             successMsg={successMsg}
        //             setSuccessMsg={setSuccessMsg}
        //             setIsOpen={setIsAddSubjectOpen}
        //         />
        //         <div className="flex gap-3">
        //             <button
        //                 onClick={() => setIsAddSubjectOpen(false)}
        //                 className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //             >
        //                 Cancel
        //             </button>

        //             <button
        //                 onClick={handleAddMultipleSubjects}
        //                 className="rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font,
        //                 }}
        //             >
        //                 Upload Subjects
        //             </button>
        //         </div>
        //     </div>



        // </div>


        // <div>
        //     {/* Body */}
        //     <div className="py-3 space-y-2">
        //         {/* Subject Code */}
        //         <div
        //             className='flex border-2 border-gray-300 rounded-sm'
        //             style={{ backgroundColor: COLORS.font }}
        //         >
        //             <label
        //                 className='border-gray-300 px-3 py-1 border-r-2 cursor-pointer'
        //                 style={{ backgroundColor: COLORS.latteDark }}
        //             >
        //                 Choose File
        //                 <input
        //                     ref={fileInputRef}
        //                     type='file'
        //                     accept='.xls, .xlsx'
        //                     className='hidden'
        //                     onChange={handleFileChange}
        //                 />
        //             </label>
        //             <div
        //                 className='w-2/3 px-2 py-1'
        //             >
        //                 {!file ? 'No file choose' : file.name}
        //             </div>
        //             {file && (
        //                 <div
        //                     className='ml-auto mr-2'
        //                     onClick={handleRemoveFile}
        //                 >
        //                     <MdOutlineCancelPresentation className='h-full w-6.25 cursor-pointer text-red-600' />
        //                 </div>
        //             )}
        //         </div>

        //         {/* Buttons */}
        //         <div className="flex justify-end gap-3 pt-2">
        //             <button
        //                 onClick={() => setIsAddSubjectOpen(false)}
        //                 className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Close
        //             </button>

        //             <button
        //                 className="hover:bg-blue-900 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                 style={{
        //                     color: COLORS.font,
        //                     backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint
        //                 }}
        //                 onClick={handleAddMultipleSubjects}
        //                 onMouseEnter={() => setIsHovered(true)}
        //                 onMouseLeave={() => setIsHovered(false)}
        //             >
        //                 Add
        //             </button>
        //         </div>

        //         {/* Divider */}
        //         <ErrorSuccessMsg
        //             errorMsg={errorMsg}
        //             successMsg={successMsg}
        //             setSuccessMsg={setSuccessMsg}
        //             setIsOpen={setIsAddSubjectOpen}
        //         />
        //     </div>
        // </div>
    );
}

export default AddMultipleSubjectsForm