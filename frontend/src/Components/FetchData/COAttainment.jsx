import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import COAttainTable from './COAttainTable';

// function COAttainment({data}) {
function COAttainment() {
    const location = useLocation();
    const data = location.state?.coAttainData;
    const { subjectId, academicYear } = useParams();
    const [subjectName, setSubject] = useState('');
    useEffect(() => {
        // const id = subjectId;
        const getSubject = async () => {
            try {
                // const res = await axios.get('/sub/', {
                //     params: { id }
                // });
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
        <div>
            <div>COAttainment</div>
            <h1>{subjectId}-{subjectName}-{academicYear}</h1>
            <COAttainTable data={data}/>
        </div>
    )
}

export default COAttainment