import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";
import useFileDownload from "../../hooks/useFileDownload";

function UploadCoPoRelation({ data, setOpenUpload }) {
    const [isHovered, setIsHovered] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleUploadMapping = async () => {
        if (!file) {
            setErrorMsg("Please choose a file!");
            return;
        }
        setErrorMsg('');
        const formData = new FormData();

        Object.entries(data).forEach(([key, val]) => {
            formData.append(key, val);
        });

        formData.append('file', file);

        try {
            const res = await axios.post('/co-po/upload-copo-excel', formData);
            setSuccessMsg(res.data.message);
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong while uploading!');
            console.log('ERROR || UploadCoPoRelation || handleUploadMapping(): ', err);
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

    const handleDownloadFormat = async () => {
        try {
            const response = await axios.get('/download-format/copo-mapping',
                {
                    responseType: 'blob',
                }
            );

            useFileDownload(response.data, 'uploadCoPoMapping.xlsx');

            // const blob = new Blob([response.data]);
            // const url = window.URL.createObjectURL(blob);

            // const link = document.createElement('a');
            // link.href = url;
            // link.download = 'uploadCoPoMapping.xlsx';

            // document.body.appendChild(link);
            // link.click();
            // link.remove();
            // window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download format!');
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setOpenUpload(false)}
        >
            <div
                className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div>
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: COLORS.font }}
                        >
                            Upload Mapping
                        </h2>

                        <p
                            className="mt-1 text-sm opacity-90"
                            style={{ color: COLORS.font }}
                        >
                            Upload an Excel file containing the mapping data.
                        </p>
                    </div>

                    <button
                        onClick={() => setOpenUpload(false)}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose
                            className="h-6 w-6"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex-1 overflow-y-auto p-5 space-y-5"
                    style={{ backgroundColor: COLORS.latte }}
                >
                    {/* File Picker */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Excel File
                        </label>

                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

                            <label
                                className="cursor-pointer border-r border-gray-300 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition hover:bg-gray-100"
                                style={{
                                    backgroundColor: COLORS.latteDark,
                                    color: COLORS.mintDark,
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

                            <div className="flex-1 truncate px-4 text-sm text-gray-600">
                                {file ? file.name : "No file selected"}
                            </div>

                            {file && (
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="px-3 text-red-500 hover:text-red-700 transition cursor-pointer"
                                >
                                    <MdOutlineCancelPresentation className="h-6 w-6" />
                                </button>
                            )}
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                            Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
                        </p>
                    </div>

                    <ErrorSuccessMsg
                        errorMsg={errorMsg}
                        successMsg={successMsg}
                        setSuccessMsg={setSuccessMsg}
                        setIsOpen={setOpenUpload}
                    />

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <button
                            onClick={handleDownloadFormat}
                            className="w-full sm:w-auto rounded-xl border border-gray-300 bg-gray-100 px-5 py-2.5 text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
                        >
                            Download Format
                        </button>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => setOpenUpload(false)}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUploadMapping}
                                className="rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition cursor-pointer"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
        //     onClick={() => setOpenUpload(false)}
        // >
        //     <div
        //         className="w-full max-w-xl max-h-[95vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl flex flex-col"
        //         onClick={(e) => e.stopPropagation()}
        //     >

        //         {/* Header */}
        //         <div
        //             className="flex items-start justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 shrink-0"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <div>

        //                 <h2
        //                     className="text-lg sm:text-xl font-semibold"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Add Faculty
        //                 </h2>


        //                 <p
        //                     className="text-xs sm:text-sm opacity-90 mt-1"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Create a new faculty account.
        //                 </p>

        //             </div>


        //             <button
        //                 onClick={() => setOpenUpload(false)}
        //                 className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer shrink-0"
        //             >
        //                 <IoMdClose
        //                     className="h-5 w-5 sm:h-6 sm:w-6"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>

        //         </div>


        //         {/* Body */}
        //         <div className="space-y-3 sm:space-y-4">
        //             {/* File Picker */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm sm:text-md font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Excel File
        //                 </label>


        //                 <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

        //                     <label
        //                         className="cursor-pointer border-r border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition hover:bg-gray-100 whitespace-nowrap"
        //                         style={{
        //                             backgroundColor: COLORS.latteDark,
        //                             color: COLORS.mintDark
        //                         }}
        //                     >
        //                         Choose File

        //                         <input
        //                             ref={fileInputRef}
        //                             type="file"
        //                             accept=".xls,.xlsx"
        //                             className="hidden"
        //                             onChange={handleFileChange}
        //                         />
        //                     </label>


        //                     <div className="flex-1 truncate px-3 sm:px-4 text-xs sm:text-sm text-gray-600">
        //                         {file ? file.name : "No file selected"}
        //                     </div>


        //                     {file && (
        //                         <button
        //                             type="button"
        //                             onClick={handleRemoveFile}
        //                             className="px-2 sm:px-3 text-red-500 transition hover:text-red-700 cursor-pointer shrink-0"
        //                         >
        //                             <MdOutlineCancelPresentation className="h-5 w-5 sm:h-6 sm:w-6" />
        //                         </button>
        //                     )}

        //                 </div>


        //                 <p className="mt-2 text-xs text-gray-500">
        //                     Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
        //                 </p>

        //             </div>


        //             {/* Footer */}
        //             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">

        //                 <button
        //                     onClick={handleDownloadFormat}
        //                     className="w-full sm:w-auto rounded-xl border border-gray-400 bg-gray-200 px-5 py-2 text-sm font-medium transition hover:bg-gray-100 cursor-pointer"
        //                 >
        //                     Download Format
        //                 </button>


        //                 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

        //                     <button
        //                         onClick={() => setOpenUpload(false)}
        //                         className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                     >
        //                         Cancel
        //                     </button>


        //                     <button
        //                         onClick={handleUploadMapping}
        //                         className="w-full sm:w-auto rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                         style={{
        //                             backgroundColor: COLORS.mint,
        //                             color: COLORS.font,
        //                         }}
        //                     >
        //                         Upload Mapping
        //                     </button>

        //                 </div>

        //             </div>


        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 setIsOpen={setOpenUpload}
        //             />

        //         </div>

        //     </div>

        // </div>
    )
}

export default UploadCoPoRelation