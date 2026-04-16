import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import COAttainTable from './COAttainTable';

function COAttainment() {
    // const location = useLocation();
    // const data = location.state?.coAttainData;
    const [data, setData] = useState(null);
    const { academicYear, course, subjectId } = useParams();
    const [subjectName, setSubjectName] = useState('');
    useEffect(() => {
        const getCOData = async () => {
            try {
                const res = await axios.get('/mark/get-calculations',
                    {
                        params: {
                            academicYear: academicYear,
                            course: course,
                            subjectId: subjectId
                        },
                    }
                );
                setData(res.data);
                console.log(res.data);

            } catch (err) {
                console.log('ERROR || useEffect - getCOData(): ', err);
            }
        }

        const getSubject = async () => {
            try {
                const res = await axios.get(`/sub/${subjectId}`);
                setSubjectName(res.data.data.subjectName);
            }
            catch (err) {
                console.log('ERROR || useEffect - getSubject(): ', err);
            }
        }

        getCOData();
        getSubject();
    }, []);

    return (
        <div className='bg-gray-300 px-2 py-4'>
            <div>
                <div className='font-semibold text-lg pb-3'>
                    {subjectId} - {subjectName} - CO Attainment, Batch - {academicYear}
                </div>
                {data && <COAttainTable data={data} />}
            </div>
        </div>
    )
}

export default COAttainment