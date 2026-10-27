// import axios from 'axios';
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import POAttainTable from './POAttainTable';
// import useDocumentTitle from '../../../hooks/useDocumentTitle';
// import useFileDownload from '../../../hooks/useFileDownload';
// import POAttainLabTable from './POAttainLabTable';
// import { COLORS } from '../../../constants/theme';
// import { IoMdDownload } from "react-icons/io";
// import Select from 'react-select';

// function POAttainment() {
//     const { subjectType, academicYear, course, subjectId } = useParams();
//     const [data, setData] = useState(null);
//     const [subjectName, setSubjectName] = useState('');
//     const [downloadType, setDownloadType] = useState('excel');

//     const downloadTypeOptions = [
//         { value: "excel", label: "Excel" },
//         { value: "print-ready", label: "Print Ready" },
//     ];

//     useDocumentTitle('PO Attainment Report');

//     useEffect(() => {
//         const getPOData = async () => {
//             try {
//                 // const res = await axios.get('/co-po/relation', {
//                 const url = subjectType === 'theory' ? '/calpo/' : '/master-route/get-po-attainment';

//                 const res = await axios.get(url, {
//                     params: {
//                         academicYear: academicYear,
//                         course: course,
//                         subjectId: subjectId
//                     },
//                 });
//                 setData(res.data.data);
//             } catch (err) {
//                 console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//                 console.log('ERROR || useEffect - getPOData(): ', err);
//             }
//         };

//         const getSubject = async () => {
//             try {
//                 const res = await axios.get(`/sub/${subjectId}`);
//                 setSubjectName(res.data.data.subjectName);
//             } catch (err) {
//                 console.log('ERROR || useEffect - getSubject(): ', err);
//             }
//         };
//         getPOData();
//         getSubject();
//     }, []);

//     // const handleDownload = async () => {
//     //     try {
//     //         const response = await axios.get('/file/FinalPo', {
//     //             params: {
//     //                 subjectId,
//     //                 course,
//     //                 academicYear
//     //             },
//     //             responseType: 'blob'
//     //         });

//     //         useFileDownload(
//     //             response.data,
//     //             `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`
//     //         );

//     //         // const url = window.URL.createObjectURL(response.data);

//     //         // const link = document.createElement('a');
//     //         // link.href = url;
//     //         // link.download = `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`;

//     //         // document.body.appendChild(link);
//     //         // link.click();

//     //         // link.remove();
//     //         // window.URL.revokeObjectURL(url);

//     //     } catch (err) {
//     //         console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
//     //         console.error('Download failed:', err);
//     //     }
//     // }
//     const handleDownload = async () => {
//         try {
//             let apiUrl;
//             if (subjectType === 'theory') {
//                 apiUrl = downloadType === 'excel' ? '/file/FinalPo' : '/theory-print-ready/theory/download-po-attainment';
//             } else {
//                 apiUrl = downloadType === 'excel' ?
//                     '/lab/download-poAttainment' : '/lab-print-ready/lab/download-po-attainment';
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
//                 `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.${downloadType === 'excel' ? 'xlsx' : 'pdf'}`
//             );

//             // const url = window.URL.createObjectURL(response.data);

//             // const link = document.createElement('a');
//             // link.href = url;
//             // link.download = `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`;

//             // document.body.appendChild(link);
//             // link.click();

//             // link.remove();
//             // window.URL.revokeObjectURL(url);

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
//                             PO Attainment Report
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

//                     {/* <button
//                         onClick={handleDownload}
//                         className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer"
//                     >
//                         Download
//                     </button> */}

//                 </div>

//                 {/* Table */}
//                 <div className="p-2">
//                     {/* {data && <POAttainTable data={data} />} */}
//                     {data && (
//                         subjectType === 'theory' ? (
//                             <POAttainTable data={data} />
//                         ) : (
//                             <POAttainLabTable data={data} />
//                         )
//                     )}
//                 </div>

//             </div>

//         </div>

//         // <div className='bg-gray-300 px-2 py-4'>
//         //     <div className='flex justify-between mx-2'>
//         //         <div className='font-semibold text-lg pb-3'>
//         //             {subjectId} - {subjectName} - PO Attainment, Batch - {academicYear}
//         //         </div>
//         //         <div>
//         //             <button
//         //                 className='border px-2 py-1 rounded-md cursor-pointer'
//         //                 onClick={handleDownload}
//         //             >
//         //                 Download
//         //             </button>
//         //         </div>
//         //     </div>
//         //     {data && <POAttainTable data={data} />}
//         // </div>
//     )
// }

// export default POAttainment







import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import POAttainTable from './POAttainTable';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useFileDownload from '../../../hooks/useFileDownload';
import POAttainLabTable from './POAttainLabTable';
import { IoMdDownload } from "react-icons/io";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

function POAttainment() {
    const { subjectType, academicYear, course, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [subjectName, setSubjectName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useDocumentTitle('PO Attainment Report');

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
        const getPOData = async () => {
            try {
                const url = subjectType === 'theory' ? '/calpo/' : '/master-route/get-po-attainment';

                const res = await axios.get(url, {
                    params: {
                        academicYear: academicYear,
                        course: course,
                        subjectId: subjectId
                    },
                });
                setData(res.data.data);
            } catch (err) {
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('ERROR || useEffect - getPOData(): ', err);
            }
        };

        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubjectName(res.data.data.subjectName);
            } catch (err) {
                console.log('ERROR || useEffect - getSubject(): ', err);
            }
        };
        
        getPOData();
        getSubject();
    }, [subjectType, academicYear, course, subjectId]);

    const handleDownload = async (type) => {
        setIsDropdownOpen(false); // Close dropdown after selection
        try {
            let apiUrl;
            if (subjectType === 'theory') {
                apiUrl = type === 'excel' ? '/file/FinalPo' : '/theory-print-ready/theory/download-po-attainment';
            } else {
                apiUrl = type === 'excel' ?
                    '/lab/download-poAttainment' : '/lab-print-ready/lab/download-po-attainment';
            }

            const response = await axios.get(apiUrl, {
                params: {
                    subjectId,
                    course,
                    academicYear
                },
                responseType: 'blob'
            });

            useFileDownload(
                response.data,
                `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
            );

        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.error('Download failed:', err);
        }
    };

    return (
        <div className="bg-slate-100 p-3">

            <div className="rounded-xl border border-gray-200 bg-white shadow">

                {/* Header */}
                <div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3">

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            PO Attainment Report
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
                            <POAttainTable data={data} />
                        ) : (
                            <POAttainLabTable data={data} />
                        )
                    )}
                </div>

            </div>

        </div>
    );
}

export default POAttainment;