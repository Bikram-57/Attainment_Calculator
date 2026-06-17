import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SubjectHeader from './SubjectHeader';
import { ActionBtns, Loading, SubjectDeleteModal, SubjectEditModal, SubjectViewModal } from '../index'

function Subject() {
    const [subjectData, setSubjectData] = useState([]);
    const [toggleNewSubject, setToggleNewSubject] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [loading, setLoading] = useState(true);

    const getSubjectData = async () => {
        try {
            const response = await axios.get('/sub/');
            console.log(response.data.data);
            setSubjectData(response.data.data);
        } catch (error) {
            console.log('Axios Error | getSubjectData(): ', error);
        } finally {
            setLoading(false);
        }
    }

    const toggleUpdate = () => {
        setToggleNewSubject(prev => !prev)
    }

    const filteredSubjects = subjectData.filter(sub => (
        (sub.subjectId.toLowerCase().includes(searchQuery.toLowerCase()) || sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
        && (filterYear.length > 0 ? sub.academicYear == filterYear : true)
    )) || subjectData;

    useEffect(() => {
        getSubjectData();
    }, [toggleNewSubject]);
    return !loading ? (
        <div className='h-full flex flex-col'>
            <SubjectHeader
                toggleUpdate={toggleUpdate}
                setSearchQuery={setSearchQuery}
                setFilterYear={setFilterYear}
            />
            <div className="flex-1 overflow-y-auto">
                {filteredSubjects?.length > 0 ?
                    (<table className='w-full'>
                        <thead>
                            <tr className='text-left border-b border-gray-300'>
                                <th className='px-5 py-2 w-[15%]'>Subject Code</th>
                                <th className='px-5 py-2 w-[35%]'>Subject Name</th>
                                <th className='px-5 py-2 w-[20%]'>Academic Year</th>
                                <th className='px-5 py-2 w-[10%]'>Course</th>
                                <th className='px-5 py-2 w-[10%]'>Status</th>
                                <th className='px-5 py-2 text-center w-[10%]'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {subjectData?.map(subject => ( */}
                            {filteredSubjects?.map(subject => (
                                <tr className='text-left border-b border-gray-300' key={subject._id}>
                                    <td className='px-5 py-2 w-[15%]'>{subject.subjectId}</td>
                                    <td className='px-5 py-2 w-[35%]'>{subject.subjectName}</td>
                                    <td className='px-5 py-2 w-[20%]'>{subject.academicYear}</td>
                                    <td className='px-5 py-2 w-[10%]'>{subject.course}</td>
                                    <td className='px-5 py-2 w-[10%]'>{subject.status}</td>
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
                    </table>) :
                    (
                        <div className='text-center text-lg'>No data available</div>
                    )
                }
            </div>
        </div>
    ) : <Loading />
}

export default Subject