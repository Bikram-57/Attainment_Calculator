import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FinalCOAttainTable from './FinalCOAttainTable';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useFileDownload from '../../../hooks/useFileDownload';

function FinalCOAttainment() {
    const { academicYear, course, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [subjectName, setSubjectName] = useState('');

    useDocumentTitle('Final CO Attainment Report');

    useEffect(() => {
        const getFinalCOData = async () => {
            try {
                const res = await axios.get('/mark/get-final-attainment', {
                    params: {
                        academicYear: academicYear,
                        course: course,
                        subjectId: subjectId
                    },
                });
                setData(res.data.data)
                console.log(res.data.data);
            } catch (err) {
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('ERROR || useEffect - getFinalCOData(): ', err);
            }
        }

        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubjectName(res.data.data.subjectName);
            } catch (err) {
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('ERROR || useEffect - getSubject(): ', err);
            }
        }
        getFinalCOData();
        getSubject();
    }, []);

    const handleDownload = async () => {
        try {
            const response = await axios.get('/file/FinalCo', {
                params: {
                    subjectId,
                    course,
                    academicYear
                },
                responseType: 'blob'
            });

            useFileDownload(
                response.data,
                `Final_CO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`
            );

            // const url = window.URL.createObjectURL(response.data);

            // const link = document.createElement('a');
            // link.href = url;
            // link.download = `Final_CO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`;

            // document.body.appendChild(link);
            // link.click();

            // link.remove();
            // window.URL.revokeObjectURL(url);

        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.error('Download failed:', err);
        }
    }

    return (
        <div className="bg-slate-100 p-3">

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3">

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Final CO Attainment Report
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-300">
                            <span className="font-medium text-white">{subjectId}</span>
                            {" • "}
                            {subjectName}
                            {" • "}
                            Batch {academicYear}
                        </p>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer"
                    >
                        Download
                    </button>

                </div>

                {/* Table */}
                <div className="p-2">
                    {data && <FinalCOAttainTable data={data} />}
                </div>

            </div>

        </div>

        // <div className='bg-gray-300 px-2 py-4'>
        //     <div className='flex justify-between mx-2'>
        //         <div className='font-semibold text-lg pb-3'>
        //             {subjectId} - {subjectName} - Final CO Attainment, Batch - {academicYear}
        //         </div>
        //         <div>
        //             <button
        //                 className='border px-2 py-1 rounded-md cursor-pointer'
        //                 onClick={handleDownload}
        //             >
        //                 Download
        //             </button>
        //         </div>
        //     </div>
        //     {data && <FinalCOAttainTable data={data} />}
        // </div>
    )
}

export default FinalCOAttainment