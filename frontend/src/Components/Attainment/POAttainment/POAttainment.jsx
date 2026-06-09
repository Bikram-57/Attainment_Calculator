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

    const handleDownload = () => {

    }

    return (
        <div className='bg-gray-300 px-2 py-4'>
            <div className='flex justify-between mx-2'>
                <div className='font-semibold text-lg pb-3'>
                    {subjectId} - {subjectName} - PO Attainment, Batch - {academicYear}
                </div>
                <div>
                    <button
                        className='border px-2 py-1 rounded-md cursor-pointer'
                        onClick={handleDownload}
                    >
                        Download
                    </button>
                </div>
            </div>
            {data && <POAttainTable data={data} />}
        </div>
    )
}

export default POAttainment