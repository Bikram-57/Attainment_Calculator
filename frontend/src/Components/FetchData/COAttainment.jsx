import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import COAttainTable from './COAttainTable';

function COAttainment() {
    const location = useLocation();
    const data = location.state?.coAttainData;
    const { subjectId, academicYear } = useParams();
    const [subjectName, setSubject] = useState('');
    useEffect(() => {
        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubject(res.data.data.subjectName);
            }
            catch (err) {
                console.log('ERROR: ', err);
            }
        }

        getSubject();
    }, []);

    return (
        <div className='bg-gray-300'>
            <div>
                <button className='bg-white border p-2 font-bold'>{'<-'}</button>
                <div className='font-semibold text-lg'>
                    {subjectId} - {subjectName} - CO Attainment, Batch - {academicYear}
                </div>
                <COAttainTable data={data} />
            </div>
        </div>
    )
}

export default COAttainment