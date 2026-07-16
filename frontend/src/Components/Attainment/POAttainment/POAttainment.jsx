import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import POAttainTable from './POAttainTable';

function POAttainment() {
    const { academicYear, course, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [subjectName, setSubjectName] = useState('');

    useEffect(() => {
        const getPOData = async () => {
            try {
                // const res = await axios.get('/co-po/relation', {
                const res = await axios.get('/calpo/', {
                    params: {
                        academicYear: academicYear,
                        course: course,
                        subjectId: subjectId
                    },
                });
                setData(res.data.data);
            } catch (err) {
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
    }, []);

    const handleDownload = async () => {
        try {
            const response = await axios.get('/file/FinalPo', {
                params: {
                    subjectId,
                    course,
                    academicYear
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(response.data);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Final_PO_Attainment_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download failed:', error);
        }
    }

    return (
        <div className="bg-slate-100 p-3">

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3">

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

                    <button
                        onClick={handleDownload}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer"
                    >
                        Download
                    </button>

                </div>

                {/* Table */}
                <div className="p-2">
                    {data && <POAttainTable data={data} />}
                </div>

            </div>

        </div>

        // <div className='bg-gray-300 px-2 py-4'>
        //     <div className='flex justify-between mx-2'>
        //         <div className='font-semibold text-lg pb-3'>
        //             {subjectId} - {subjectName} - PO Attainment, Batch - {academicYear}
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
        //     {data && <POAttainTable data={data} />}
        // </div>
    )
}

export default POAttainment