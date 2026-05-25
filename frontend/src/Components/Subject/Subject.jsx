import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SubjectHeader from './SubjectHeader';
import { ActionBtns } from '../index'

function Subject() {
    const [subjectData, setSubjectData] = useState([]);

    const getSubjectData = async () => {
        try {
            const response = await axios.get('/sub/');
            setSubjectData(response.data.data);

        } catch (error) {
            console.log('Axios Error | getSubjectData(): ', error);
        }
    }

    useEffect(() => {
        getSubjectData();
    }, []);
    return (
        <div className='h-full flex flex-col'>
            <SubjectHeader />
            <div className="flex-1 overflow-y-auto">
                <table className='w-full'>
                    <thead>
                        <tr className='text-left border-b border-gray-300'>
                            <th className='px-5 py-2 w-[15%]'>Subject Code</th>
                            <th className='px-5 py-2 w-[35%]'>Subject Name</th>
                            <th className='px-5 py-2 w-[35%]'>Course</th>
                            <th className='px-5 py-2 text-center w-[15%]'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectData?.map(sub => (
                            <tr className='text-left border-b border-gray-300' key={sub._id}>
                                <td className='px-5 py-2 w-[15%]'>{sub.subjectId}</td>
                                <td className='px-5 py-2 w-[35%]'>{sub.subjectName}</td>
                                <td className='px-5 py-2 w-[35%]'>{sub.course}</td>
                                <td className='px-5 py-2 flex items-center justify-center'>
                                    <ActionBtns />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Subject