import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SubjectHeader from './SubjectHeader';
import { ActionBtns, SubjectDeleteModal, SubjectEditModal, SubjectViewModal } from '../index'

function Subject() {
    const [subjectData, setSubjectData] = useState([]);
    const [toggleNewSubject, setToggleNewSubject] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getSubjectData = async () => {
        try {
            const response = await axios.get('/sub/');
            setSubjectData(response.data.data);

        } catch (error) {
            console.log('Axios Error | getSubjectData(): ', error);
        }
    }

    const toggleUpdate = () => {
        setToggleNewSubject(prev => !prev)
    }

    const filteredSubjects = subjectData.filter(sub => (
        sub.subjectId.toLowerCase().includes(searchQuery) || sub.subjectName.toLowerCase().includes(searchQuery)
    )) || subjectData;

    useEffect(() => {
        getSubjectData();
    }, [toggleNewSubject]);
    return (
        <div className='h-full flex flex-col'>
            <SubjectHeader toggleUpdate={toggleUpdate} setSearchQuery={setSearchQuery} />
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
                        {/* {subjectData?.map(subject => ( */}
                        {filteredSubjects?.map(subject => (
                            <tr className='text-left border-b border-gray-300' key={subject._id}>
                                <td className='px-5 py-2 w-[15%]'>{subject.subjectId}</td>
                                <td className='px-5 py-2 w-[35%]'>{subject.subjectName}</td>
                                <td className='px-5 py-2 w-[35%]'>{subject.course}</td>
                                <td className='px-5 py-2 flex items-center justify-center'>
                                    <ActionBtns
                                        data={subject}
                                        toggleUpdate={toggleUpdate}
                                        ViewModal={SubjectViewModal}
                                        EditModal={SubjectEditModal}
                                        DeleteModal={SubjectDeleteModal}
                                    />
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