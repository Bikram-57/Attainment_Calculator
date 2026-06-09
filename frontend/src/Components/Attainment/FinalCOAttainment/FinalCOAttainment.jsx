import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FinalCOAttainTable from './FinalCOAttainTable';

function FinalCOAttainment() {
    const { academicYear, course, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [subjectName, setSubjectName] = useState('');

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
                console.log('ERROR || useEffect - getFinalCOData(): ', err);
            }
        }

        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubjectName(res.data.data.subjectName);
            } catch (err) {
                console.log('ERROR || useEffect - getSubject(): ', err);
            }
        }
        getFinalCOData();
        getSubject();
    }, []);

    const handleDownload = () => {
        
    }

    return (
        <div className='bg-gray-300 px-2 py-4'>
            <div className='flex justify-between mx-2'>
                <div className='font-semibold text-lg pb-3'>
                    {subjectId} - {subjectName} - Final CO Attainment, Batch - {academicYear}
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
            {data && <FinalCOAttainTable data={data} />}
        </div>
    )
}

export default FinalCOAttainment