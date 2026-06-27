import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SubjectHeader from './SubjectHeader';
import { FaCheckCircle, FaClock } from "react-icons/fa";
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
        (
            sub.subjectId.toLowerCase().includes(searchQuery.toLowerCase().trim())
            || sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        && (
            filterYear ? sub.academicYear == filterYear : true
        )
    ))

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
                            <tr className='text-center border-b border-gray-300'>
                                <th className='px-5 py-2 w-[15%] text-left'>Subject Code</th>
                                <th className='px-5 py-2 w-[30%] text-left'>Subject Name</th>
                                <th className='px-5 py-2 w-[15%]'>Academic Year</th>
                                <th className='px-5 py-2 w-[10%]'>Semester</th>
                                <th className='px-5 py-2 w-[10%]'>Course</th>
                                <th className='px-5 py-2 w-[10%]'>Status</th>
                                <th className='px-5 py-2 w-[10%]'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects?.map(subject => (
                                <tr className='text-center border-b border-gray-300' key={subject._id}>
                                    <td className='px-5 py-2 w-[15%] text-left'>{subject.subjectId}</td>
                                    <td className='px-5 py-2 w-[30%] text-left'>{subject.subjectName}</td>
                                    <td className='px-5 py-2 w-[15%]'>{subject.academicYear}</td>
                                    <td className='px-5 py-2 w-[10%]'>{subject.semester || '-'}</td>
                                    <td className='px-5 py-2 w-[10%]'>{subject.course}</td>
                                    <td className='px-5 py-2 w-[10%]'>
                                        <div
                                            className={`flex items-center gap-2 rounded-full w-full px-3 py-1 text-sm font-medium
                                                ${subject.status === 'Uploaded'
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {subject.status === 'Uploaded' ? (
                                                <FaCheckCircle />
                                            ) : (
                                                <FaClock />
                                            )}

                                            {subject.status}
                                        </div>
                                    </td>
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