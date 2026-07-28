import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SubjectHeader from './SubjectHeader';
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { ActionBtns, Loading, SubjectDeleteModal, SubjectEditModal, SubjectViewModal } from '../index'
import useDocumentTitle from '../../hooks/useDocumentTitle';

function Subject() {
    const [subjectData, setSubjectData] = useState([]);
    const [toggleNewSubject, setToggleNewSubject] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterCourse, setFilterCourse] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [loading, setLoading] = useState(true);

    useDocumentTitle('Manage Subjects');

    const toggleUpdate = () => {
        setToggleNewSubject(prev => !prev)
    }

    const filteredSubjects = subjectData.filter(sub => (
        (
            sub.subjectId.toLowerCase().includes(searchQuery.toLowerCase().trim())
            || sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        && (
            filterCourse ? sub.course == filterCourse : true
        )
        && (
            filterSemester ? sub.semester == filterSemester : true
        )
    ))

    useEffect(() => {
        const getSubjectData = async () => {
            try {
                const res = await axios.get(`/sub/year/${filterYear}`);
                setSubjectData(res.data.data);
            } catch (error) {
                console.log('Axios Error | getSubjectData(): ', error);
            } finally {
                setLoading(false);
            }
        }

        getSubjectData();
    }, [filterYear, toggleNewSubject]);
    return !loading ? (
        <div className="h-full flex flex-col bg-slate-50">
            <SubjectHeader
                toggleUpdate={toggleUpdate}
                setSearchQuery={setSearchQuery}
                setFilterYear={setFilterYear}
                setFilterCourse={setFilterCourse}
                setFilterSemester={setFilterSemester}
            />

            <div className="flex-1 overflow-hidden p-2 sm:p-3">
                <div className="h-full rounded-xl sm:rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">

                    {filteredSubjects.length ? (
                        <div className="h-full overflow-auto">
                            <table className="min-w-225 w-full border-collapse">

                                <thead className="sticky top-0 bg-slate-100 z-20">
                                    <tr className="text-xs sm:text-sm uppercase tracking-wide text-slate-600">

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                                            Subject Code
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                                            Subject Name
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            Academic Year
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            Semester
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            Course
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            Status
                                        </th>

                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSubjects.map(subject => (

                                        <tr
                                            key={subject._id}
                                            className="border-b border-slate-100 even:bg-slate-50 hover:bg-blue-50 transition-all duration-200"
                                        >

                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base text-slate-800">
                                                {subject.subjectId}
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="font-semibold text-sm sm:text-base">
                                                    {subject.subjectName}
                                                </div>
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-sm">
                                                {subject.academicYear}
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-sm">
                                                {subject.semester || "-"}
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                                <span className="inline-block rounded-lg bg-indigo-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-indigo-700">
                                                    {subject.course}
                                                </span>
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div
                                                    className={`
                                                inline-flex items-center gap-1 sm:gap-2 
                                                rounded-full px-3 sm:px-4 py-1.5 sm:py-2 
                                                text-xs sm:text-sm font-semibold whitespace-nowrap
                                                ${subject.status === "Uploaded"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-amber-100 text-amber-700"
                                                        }
                                            `}
                                                >
                                                    {subject.status === "Uploaded"
                                                        ? <FaCheckCircle />
                                                        : <FaClock />
                                                    }

                                                    {subject.status}
                                                </div>
                                            </td>

                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex justify-center">
                                                    <ActionBtns
                                                        data={subject}
                                                        toggleUpdate={toggleUpdate}
                                                        ViewModal={SubjectViewModal}
                                                        EditModal={SubjectEditModal}
                                                        DeleteModal={SubjectDeleteModal}
                                                    />
                                                </div>
                                            </td>

                                        </tr>

                                    ))}
                                </tbody>

                            </table>
                        </div>

                    ) : (

                        <div className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 text-slate-500 px-4 text-center">

                            <div className="text-5xl sm:text-6xl">
                                📚
                            </div>

                            <h2 className="text-lg sm:text-xl font-semibold">
                                No Subjects Found
                            </h2>

                            <p className="text-xs sm:text-sm">
                                Try changing your search or filters.
                            </p>

                        </div>

                    )}

                </div>
            </div>
        </div>

        // <div className="h-full flex flex-col bg-slate-50">
        //     <SubjectHeader
        //         toggleUpdate={toggleUpdate}
        //         setSearchQuery={setSearchQuery}
        //         setFilterYear={setFilterYear}
        //         setFilterCourse={setFilterCourse}
        //         setFilterSemester={setFilterSemester}
        //     />

        //     <div className="flex-1 overflow-hidden p-3">
        //         <div className="h-full rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">

        //             {filteredSubjects.length ? (
        //                 <div className="h-full overflow-auto">

        //                     <table className="w-full border-collapse">

        //                         <thead className="sticky top-0 bg-slate-100 z-2">
        //                             <tr className="text-sm uppercase tracking-wide text-slate-600">

        //                                 <th className="px-6 py-4 text-left">
        //                                     Subject Code
        //                                 </th>

        //                                 <th className="px-6 py-4 text-left">
        //                                     Subject Name
        //                                 </th>

        //                                 <th className="px-6 py-4 text-center">
        //                                     Academic Year
        //                                 </th>

        //                                 <th className="px-6 py-4 text-center">
        //                                     Semester
        //                                 </th>

        //                                 <th className="px-6 py-4 text-center">
        //                                     Course
        //                                 </th>

        //                                 <th className="px-6 py-4 text-center">
        //                                     Status
        //                                 </th>

        //                                 <th className="px-6 py-4 text-center">
        //                                     Actions
        //                                 </th>

        //                             </tr>
        //                         </thead>

        //                         <tbody>

        //                             {filteredSubjects.map(subject => (

        //                                 <tr
        //                                     key={subject._id}
        //                                     className="border-b border-slate-100 even:bg-slate-50 hover:bg-blue-50 transition-all duration-200"
        //                                 >
        //                                     <td className="px-6 py-4 font-medium text-slate-800">
        //                                         {subject.subjectId}
        //                                     </td>

        //                                     <td className="px-6 py-4">
        //                                         <div className="font-semibold">
        //                                             {subject.subjectName}
        //                                         </div>
        //                                     </td>

        //                                     <td className="px-6 py-4 text-center">
        //                                         {subject.academicYear}
        //                                     </td>

        //                                     <td className="px-6 py-4 text-center">
        //                                         {subject.semester || "-"}
        //                                     </td>

        //                                     <td className="px-6 py-4 text-center">

        //                                         <span className="rounded-lg bg-indigo-100 px-3 py-1 text-indigo-700 text-sm font-medium">
        //                                             {subject.course}
        //                                         </span>

        //                                     </td>

        //                                     <td className="px-6 py-4">

        //                                         <div
        //                                             className={
        //                                                 `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
        //                                                 ${subject.status === "Uploaded"
        //                                                     ? "bg-green-100 text-green-700"
        //                                                     : "bg-amber-100 text-amber-700"
        //                                                 }`
        //                                             }
        //                                         >
        //                                             {subject.status === "Uploaded"
        //                                                 ? <FaCheckCircle />
        //                                                 : <FaClock />
        //                                             }

        //                                             {subject.status}
        //                                         </div>

        //                                     </td>

        //                                     <td className="px-6 py-4">

        //                                         <div className="flex justify-center">
        //                                             <ActionBtns
        //                                                 data={subject}
        //                                                 toggleUpdate={toggleUpdate}
        //                                                 ViewModal={SubjectViewModal}
        //                                                 EditModal={SubjectEditModal}
        //                                                 DeleteModal={SubjectDeleteModal}
        //                                             />
        //                                         </div>

        //                                     </td>

        //                                 </tr>

        //                             ))}

        //                         </tbody>

        //                     </table>

        //                 </div>
        //             ) : (

        //                 <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500">

        //                     <div className="text-6xl">
        //                         📚
        //                     </div>

        //                     <h2 className="text-xl font-semibold">
        //                         No Subjects Found
        //                     </h2>

        //                     <p className="text-sm">
        //                         Try changing your search or filters.
        //                     </p>

        //                 </div>

        //             )}

        //         </div>
        //     </div>
        // </div>



        // <div className='h-full flex flex-col'>
        //     <SubjectHeader
        //         toggleUpdate={toggleUpdate}
        //         setSearchQuery={setSearchQuery}
        //         setFilterYear={setFilterYear}
        //         setFilterCourse={setFilterCourse}
        //         setFilterSemester={setFilterSemester}
        //     />
        //     <div className="flex-1 overflow-y-auto">
        //         {filteredSubjects?.length > 0 ?
        //             (<table className='w-full'>
        //                 <thead>
        //                     <tr className='text-center border-b border-gray-300'>
        //                         <th className='px-5 py-2 w-[15%] text-left'>Subject Code</th>
        //                         <th className='px-5 py-2 w-[30%] text-left'>Subject Name</th>
        //                         <th className='px-5 py-2 w-[15%]'>Academic Year</th>
        //                         <th className='px-5 py-2 w-[10%]'>Semester</th>
        //                         <th className='px-5 py-2 w-[10%]'>Course</th>
        //                         <th className='px-5 py-2 w-[10%]'>Status</th>
        //                         <th className='px-5 py-2 w-[10%]'>Action</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {filteredSubjects?.map(subject => (
        //                         <tr className='text-center border-b border-gray-300' key={subject._id}>
        //                             <td className='px-5 py-2 w-[15%] text-left'>{subject.subjectId}</td>
        //                             <td className='px-5 py-2 w-[30%] text-left'>{subject.subjectName}</td>
        //                             <td className='px-5 py-2 w-[15%]'>{subject.academicYear}</td>
        //                             <td className='px-5 py-2 w-[10%]'>{subject.semester || '-'}</td>
        //                             <td className='px-5 py-2 w-[10%]'>{subject.course}</td>
        //                             <td className='px-5 py-2 w-[10%]'>
        //                                 <div
        //                                     className={`flex items-center gap-2 rounded-full w-full px-3 py-1 text-sm font-medium
        //                                         ${subject.status === 'Uploaded'
        //                                             ? "bg-green-100 text-green-700"
        //                                             : "bg-amber-100 text-amber-700"
        //                                         }`}
        //                                 >
        //                                     {subject.status === 'Uploaded' ? (
        //                                         <FaCheckCircle />
        //                                     ) : (
        //                                         <FaClock />
        //                                     )}

        //                                     {subject.status}
        //                                 </div>
        //                             </td>
        //                             <td className='px-5 py-2 flex items-center justify-center'>
        //                                 <ActionBtns
        //                                     data={subject}
        //                                     toggleUpdate={toggleUpdate}
        //                                     ViewModal={SubjectViewModal}
        //                                     EditModal={SubjectEditModal}
        //                                     DeleteModal={SubjectDeleteModal}
        //                                 />
        //                             </td>
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>) :
        //             (
        //                 <div className='text-center text-lg'>No data available</div>
        //             )
        //         }
        //     </div>
        // </div>
    ) : <Loading />
}

export default Subject