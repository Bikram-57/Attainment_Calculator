// import axios from 'axios';
// import React, { useEffect } from 'react'
// import { useState } from 'react';
// import { useParams } from 'react-router-dom'
// import COAttainTable from './COAttainTable';
// import useDocumentTitle from '../../../hooks/useDocumentTitle';
// import useFileDownload from '../../../hooks/useFileDownload';
// import COAttainLabTable from './COAttainLabTable';
// import Select from 'react-select';
// import { COLORS } from '../../../constants/theme';
// import { IoMdDownload } from "react-icons/io";

// function COAttainment() {
//     // const location = useLocation();
//     // const data = location.state?.coAttainData;
//     const [data, setData] = useState(null);
//     const [subjectName, setSubjectName] = useState('');
//     const [downloadType, setDownloadType] = useState('excel');

//     const { subjectType, academicYear, course, subjectId } = useParams();

//     useDocumentTitle('CO Attainment Report');

//     const downloadTypeOptions = [
//         { value: "excel", label: "Excel" },
//         { value: "print-ready", label: "Print Ready" },
//     ];

//     useEffect(() => {
//         const getCOData = async () => {
//             try {
//                 // const res = await axios.get('/mark/get-calculations',
//                 const url = subjectType === 'theory' ? '/mark/get-calculations' : '/master-route/get-co-attainment';

//                 const res = await axios.get(url,
//                     {
//                         params: {
//                             academicYear: academicYear,
//                             course: course,
//                             subjectId: subjectId
//                         },
//                     }
//                 );
//                 setData(res.data);
//                 console.log(res.data);

//             } catch (err) {
//                 console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//                 console.log('ERROR || useEffect - getCOData(): ', err);
//             }
//         }

//         const getSubject = async () => {
//             try {
//                 const res = await axios.get(`/sub/${subjectId}`);
//                 setSubjectName(res.data.data.subjectName);
//             }
//             catch (err) {
//                 console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//                 console.log('ERROR || useEffect - getSubject(): ', err);
//             }
//         }

//         getCOData();
//         getSubject();
//     }, []);

//     // const handleDownload = async () => {
//     //     try {
//     //         const response = await axios.get('/file/calMark', {
//     //             params: {
//     //                 subjectId,
//     //                 course,
//     //                 academicYear
//     //             },
//     //             responseType: 'blob'
//     //         });

//     //         useFileDownload(
//     //             response.data,
//     //             `CalculatedMarks_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`
//     //         );

//     //         // const url = window.URL.createObjectURL(response.data);

//     //         // const link = document.createElement('a');
//     //         // link.href = url;
//     //         // link.download = `CalculatedMarks_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`;

//     //         // document.body.appendChild(link);
//     //         // link.click();

//     //         // link.remove();
//     //         window.URL.revokeObjectURL(url);

//     //     } catch (err) {
//     //         console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//     //         console.error('Download failed:', err);
//     //     }
//     // }

//     const handleDownload = async () => {
//         try {
//             let apiUrl;
//             if (subjectType === 'theory') {
//                 apiUrl = downloadType === 'excel' ? '/file/calMark' : '/theory-print-ready/download-calculated-co-attainment';
//             } else {
//                 apiUrl = downloadType === 'excel' ? '/lab/download-coAttainment' : '/lab-print-ready/download-co-attainment-pdf';
//             }

//             const response = await axios.get(apiUrl, {
//                 params: {
//                     subjectId,
//                     course,
//                     academicYear
//                 },
//                 responseType: 'blob'
//             });

//             useFileDownload(
//                 response.data,
//                 `CalculatedMarks_${subjectId}_${academicYear.replace(/\//g, '-')}.${downloadType === 'excel' ? 'xlsx' : 'pdf'}`
//             );

//         } catch (err) {
//             console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//             console.error('Download failed:', err);
//         }
//     }

//     return (
//         <div className="bg-slate-100 p-3">

//             <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">

//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3">

//                     <div>
//                         <h2 className="text-lg font-semibold text-white">
//                             CO Attainment Report
//                         </h2>

//                         <p className="mt-0.5 text-xs text-slate-300">
//                             <span className="font-medium text-white">{subjectId}</span>
//                             {" • "}
//                             {subjectName}
//                             {" • "}
//                             Batch {academicYear}
//                         </p>
//                     </div>

//                     <div className='flex gap-2 z-40 items-center'>
//                         <label
//                             className="block text-md font-semibold"
//                             style={{ color: COLORS.font }}
//                         >
//                             Download type:
//                         </label>
//                         <div className='w-35'>
//                             <Select
//                                 options={downloadTypeOptions}
//                                 placeholder="Select download type"
//                                 value={
//                                     downloadTypeOptions.find(
//                                         (option) => option.value === downloadType
//                                     ) || null
//                                 }
//                                 onChange={(selected) =>
//                                     setDownloadType(selected?.value || "")
//                                 }
//                                 maxMenuHeight={120}
//                             />
//                         </div>
//                         <button
//                             onClick={handleDownload}
//                             className="rounded-md bg-white px-1 py-1 text-2xl font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer"
//                         >
//                             <IoMdDownload />
//                         </button>
//                     </div>

//                 </div>

//                 {/* Table */}
//                 <div className="p-2">
//                     {/* {data && <COAttainTable data={data} />} */}
//                     {data && (
//                         subjectType === 'theory' ? (
//                             <COAttainTable data={data} />
//                         ) : (
//                             <COAttainLabTable data={data} />
//                         )
//                     )}
//                 </div>

//             </div>

//         </div>

//         // <div className="h-full bg-slate-100 p-6">

//         //     <div className="mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

//         //         {/* Header */}
//         //         <div className="flex flex-col gap-4 border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-6 py-5 md:flex-row md:items-center md:justify-between">

//         //             <div>

//         //                 <h2 className="text-2xl font-bold text-white">
//         //                     CO Attainment Report
//         //                 </h2>

//         //                 <p className="mt-2 text-sm text-slate-300">
//         //                     <span className="font-semibold text-white">{subjectId}</span>
//         //                     {" • "}
//         //                     {subjectName}
//         //                     {" • "}
//         //                     Batch {academicYear}
//         //                 </p>

//         //             </div>

//         //             <button
//         //                 onClick={handleDownload}
//         //                 className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow transition hover:scale-105 hover:bg-slate-100 cursor-pointer"
//         //             >
//         //                 Download Report
//         //             </button>

//         //         </div>

//         //         {/* Table */}
//         //         <div className="p-5">
//         //             {data && <COAttainTable data={data} />}
//         //         </div>

//         //     </div>

//         // </div>

//         // <div className='bg-gray-300 px-2 py-4'>
//         //     <div>
//         //         <div className='flex justify-between mx-2'>
//         //             <div className='font-semibold text-lg pb-3'>
//         //                 {subjectId} - {subjectName} - CO Attainment, Batch - {academicYear}
//         //             </div>
//         //             <div>
//         //                 <button
//         //                     className='border px-2 py-1 rounded-md cursor-pointer'
//         //                     onClick={handleDownload}
//         //                 >
//         //                     Download
//         //                 </button>
//         //             </div>
//         //         </div>
//         //         {data && <COAttainTable data={data} />}
//         //     </div>
//         // </div>
//     )
// }

// export default COAttainment














import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import COAttainTable from './COAttainTable';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useFileDownload from '../../../hooks/useFileDownload';
import COAttainLabTable from './COAttainLabTable';
import { IoMdDownload } from "react-icons/io";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

function COAttainment() {
    const [data, setData] = useState(null);
    const [subjectName, setSubjectName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { subjectType, academicYear, course, subjectId } = useParams();

    useDocumentTitle('CO Attainment Report');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const getCOData = async () => {
            try {
                const url = subjectType === 'theory' ? '/mark/get-calculations' : '/master-route/get-co-attainment';

                const res = await axios.get(url, {
                    params: {
                        academicYear: academicYear,
                        course: course,
                        subjectId: subjectId
                    },
                });
                setData(res.data);
                console.log(res.data);

            } catch (err) {
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('ERROR || useEffect - getCOData(): ', err);
            }
        };

        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubjectName(res.data.data.subjectName);
            } catch (err) {
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('ERROR || useEffect - getSubject(): ', err);
            }
        };

        getCOData();
        getSubject();
    }, [subjectType, academicYear, course, subjectId]);

    const handleDownload = async (type) => {
        setIsDropdownOpen(false); // Close dropdown after selecting an option
        try {
            let apiUrl;

            if (subjectType === 'theory') {
                // Updated the PDF route for theory subjects here 👇
                apiUrl = type === 'excel'
                    ? '/file/calMark'
                    : '/theory-print-ready/theory/download-calculated-marks';
            } else {
                apiUrl = type === 'excel'
                    ? '/lab/download-coAttainment'
                    : '/lab-print-ready/download-co-attainment-pdf';
            }

            const response = await axios.get(apiUrl, {
                params: {
                    subjectId,
                    course,
                    academicYear
                },
                // responseType: 'blob' is required for both Excel and PDF downloads
                responseType: 'blob'
            });

            useFileDownload(
                response.data,
                `CalculatedMarks_${subjectId}_${academicYear.replace(/\//g, '-')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
            );

        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.error('Download failed:', err);
        }
    };


    return (
        <div className="bg-slate-100 p-3">

            {/* Removed overflow-hidden from main card so the dropdown menu isn't clipped */}
            <div className="rounded-xl border border-gray-200 bg-white shadow">

                {/* Header */}
                <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3">

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            CO Attainment Report
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-300">
                            <span className="font-medium text-white">{subjectId}</span>
                            {" • "}
                            {subjectName}
                            {" • "}
                            Batch {academicYear}
                        </p>
                    </div>

                    {/* Download Dropdown Button */}
                    <div className="relative z-40" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer"
                        >
                            <IoMdDownload className="text-lg" />
                            <span>Download</span>
                            <IoChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                                <button
                                    onClick={() => handleDownload('excel')}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                                >
                                    <FaFileExcel className="text-green-600 text-base" />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                                >
                                    <FaFilePdf className="text-red-600 text-base" />
                                    <span>PDF</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Table */}
                <div className="p-2">
                    {data && (
                        subjectType === 'theory' ? (
                            <COAttainTable data={data} />
                        ) : (
                            <COAttainLabTable data={data} />
                        )
                    )}
                </div>

            </div>

        </div>
    );
}

export default COAttainment;