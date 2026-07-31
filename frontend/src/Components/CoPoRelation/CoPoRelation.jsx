import React, { useEffect, useState } from 'react'
import { MdRemoveRedEye } from "react-icons/md";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import ViewCoPoRelation from './ViewCoPoRelation';
import EditCoPoRelation from './EditCoPoRelation';
import { COLORS } from '../../constants/theme'
import { CoPoRelationHeader, Loading } from '../index';
import { useSelector } from 'react-redux';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function CoPoRelation() {
    const userData = useSelector(state => state.auth.userData);

    const [subjects, setSubjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedSubjectData, setSelectedSubjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterCourse, setFilterCourse] = useState('');
    const [filterSemester, setFilterSemester] = useState('');

    useDocumentTitle('CO PO Relations - Menu');

    const fetchSelectedCoPoData = async (sub) => {
        setSelectedSubjectData({
            subjectId: sub.subjectId,
            academicYear: sub.academicYear,
            course: sub.course
        });
        try {
            const res = await axios.get('/co-po/relation', {
                params: {
                    subjectId: sub.subjectId,
                    academicYear: sub.academicYear,
                    course: sub.course
                }
            });
            setSelectedSubjectData(res.data);
        } catch (error) {
            console.log('Axios Error | ViewCoPoRelation | fetchSelectedCoPoData(): ', error);
        } finally {
            setLoading(false);
        }
    }

    const handleViewOpen = async (sub) => {
        setLoading(true);
        await fetchSelectedCoPoData(sub);
        setOpenView(true);
    }

    const handleEditOpen = async (sub) => {
        setLoading(true);
        await fetchSelectedCoPoData(sub);
        setOpenEdit(true);
    }



    const filteredSubjects = subjects?.filter(sub => (
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
    ));

    useEffect(() => {
        const fetchCoPoSubjectList = async () => {
            try {
                let res;
                if (userData.role === 'admin') {
                    res = await axios.get(`/sub/year/${filterYear}`);
                    setSubjects(res.data.data);
                } else {
                    res = await axios.get('/co-po/filter', {
                        params: {
                            year: filterYear
                        }
                    });
                    setSubjects(res.data.data.subjects);
                }
                console.log('yes1');
            } catch (error) {
                console.log('yes2');
                setSubjects([])
                console.log('Axios Error | CoPoRelation | fetchCoPoSubjectList(): ', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCoPoSubjectList();
    }, [filterYear]);

    if (!openView && !openEdit) {
        return !loading ? (
            <div
                className="flex h-full w-full flex-col rounded-2xl border border-gray-200 shadow-sm"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <CoPoRelationHeader
                    setSearchQuery={setSearchQuery}
                    setFilterYear={setFilterYear}
                    setFilterCourse={setFilterCourse}
                    setFilterSemester={setFilterSemester}
                />

                {/* Table */}
                <div className="p-1 sm:p-2 lg:p-3">
                    <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

                        {filteredSubjects?.length > 0 ? (

                            <table className="min-w-250 w-full text-sm lg:text-[15px]">

                                <thead className="sticky top-0 z-2 shadow-sm">
                                    <tr
                                        style={{
                                            backgroundColor: COLORS.mint,
                                            color: COLORS.font,
                                        }}
                                    >
                                        <th className="whitespace-nowrap px-5 py-3 text-left font-semibold">
                                            Subject Code
                                        </th>

                                        <th className="px-5 py-3 text-left font-semibold">
                                            Subject Name
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
                                            Year
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
                                            Semester
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
                                            Course
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
                                            Status
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-center font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSubjects.map((subject) => (
                                        <tr
                                            key={subject.subjectId}
                                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800">
                                                {subject.subjectId}
                                            </td>

                                            <td className="min-w-55 px-5 py-3 text-slate-700">
                                                {subject.subjectName}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-3 text-center">
                                                {subject.academicYear}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-3 text-center">
                                                {subject.semester || "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-3 text-center">
                                                {subject.course}
                                            </td>

                                            <td className="px-5 py-3">
                                                <div className="flex justify-center">
                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${subject.copoMappingStatus === "Uploaded"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        {subject.copoMappingStatus === "Uploaded" ? (
                                                            <FaCheckCircle size={14} />
                                                        ) : (
                                                            <FaClock size={14} />
                                                        )}

                                                        {subject.copoMappingStatus}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() => handleViewOpen(subject)}
                                                        className="rounded-lg p-2.5 transition hover:opacity-90 cursor-pointer"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                        title="View Mapping"
                                                    >
                                                        <MdRemoveRedEye size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditOpen(subject)}
                                                        className="rounded-lg p-2.5 transition hover:opacity-90 cursor-pointer"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                        title="Edit Mapping"
                                                    >
                                                        <GrEdit size={15} />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        ) : (

                            <div className="flex min-h-125 flex-col items-center justify-center px-6 text-center">

                                <div className="mb-4 rounded-full bg-gray-100 p-5">
                                    <MdRemoveRedEye
                                        size={36}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-700 sm:text-xl">
                                    No Relation Found
                                </h3>

                                <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
                                    No subjects match the selected filters.
                                </p>

                            </div>

                        )}

                    </div>
                </div>
            </div>

            // <div
            //     className="flex h-full flex-col rounded-2xl border border-gray-200 shadow-sm"
            //     style={{ backgroundColor: COLORS.latte }}
            // >
            //     {/* Header */}
            //     <CoPoRelationHeader
            //         setSearchQuery={setSearchQuery}
            //         setFilterYear={setFilterYear}
            //         setFilterCourse={setFilterCourse}
            //         setFilterSemester={setFilterSemester}
            //     />

            //     {/* Table */}
            //     {/* <div className="flex-1 overflow-hidden px-5 pb-5"> */}
            //     <div className="flex-1 overflow-hidden m-3">

            //         <div className="h-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

            //             {filteredSubjects?.length > 0 ? (

            //                 <table className="min-w-full text-sm">

            //                     <thead className="sticky top-0 z-2">
            //                         <tr
            //                             style={{
            //                                 backgroundColor: COLORS.mint,
            //                                 color: COLORS.font,
            //                             }}
            //                         >
            //                             <th className="px-5 py-3 text-left font-semibold">Subject Code</th>
            //                             <th className="px-5 py-3 text-left font-semibold">Subject Name</th>
            //                             <th className="px-5 py-3 text-center font-semibold">Year</th>
            //                             <th className="px-5 py-3 text-center font-semibold">Semester</th>
            //                             <th className="px-5 py-3 text-center font-semibold">Course</th>
            //                             <th className="px-5 py-3 text-center font-semibold">Status</th>
            //                             <th className="px-5 py-3 text-center font-semibold">Actions</th>
            //                         </tr>
            //                     </thead>

            //                     <tbody>

            //                         {filteredSubjects.map((subject, index) => (

            //                             <tr
            //                                 key={subject.subjectId}
            //                                 className="border-b border-gray-100 transition hover:bg-gray-50"
            //                             >

            //                                 <td className="px-5 py-3 font-medium text-slate-800">
            //                                     {subject.subjectId}
            //                                 </td>

            //                                 <td className="px-5 py-3 text-slate-700">
            //                                     {subject.subjectName}
            //                                 </td>

            //                                 <td className="px-5 py-3 text-center">
            //                                     {subject.academicYear}
            //                                 </td>

            //                                 <td className="px-5 py-3 text-center">
            //                                     {subject.semester || "-"}
            //                                 </td>

            //                                 <td className="px-5 py-3 text-center">
            //                                     {subject.course}
            //                                 </td>

            //                                 <td className="px-5 py-3">
            //                                     <div className="flex justify-center">
            //                                         <span
            //                                             className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
            //                                 ${subject.copoMappingStatus === "Uploaded"
            //                                                     ? "bg-green-100 text-green-700"
            //                                                     : "bg-amber-100 text-amber-700"
            //                                                 }`}
            //                                         >
            //                                             {subject.copoMappingStatus === "Uploaded" ? (
            //                                                 <FaCheckCircle size={14} />
            //                                             ) : (
            //                                                 <FaClock size={14} />
            //                                             )}

            //                                             {subject.copoMappingStatus}
            //                                         </span>
            //                                     </div>
            //                                 </td>

            //                                 <td className="px-5 py-3">
            //                                     <div className="flex justify-center gap-2">

            //                                         <button
            //                                             onClick={() => handleViewOpen(subject)}
            //                                             className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
            //                                             style={{
            //                                                 backgroundColor: COLORS.mint,
            //                                                 color: COLORS.font,
            //                                             }}
            //                                             title="View Mapping"
            //                                         >
            //                                             <MdRemoveRedEye size={16} />
            //                                         </button>

            //                                         <button
            //                                             onClick={() => handleEditOpen(subject)}
            //                                             className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
            //                                             style={{
            //                                                 backgroundColor: COLORS.mint,
            //                                                 color: COLORS.font,
            //                                             }}
            //                                             title="Edit Mapping"
            //                                         >
            //                                             <GrEdit size={15} />
            //                                         </button>

            //                                     </div>
            //                                 </td>

            //                             </tr>

            //                         ))}

            //                     </tbody>

            //                 </table>

            //             ) : (

            //                 <div className="flex h-full min-h-87.5 flex-col items-center justify-center">

            //                     <div className="mb-4 rounded-full bg-gray-100 p-5">
            //                         <MdRemoveRedEye
            //                             size={36}
            //                             className="text-gray-400"
            //                         />
            //                     </div>

            //                     <h3 className="text-lg font-semibold text-gray-700">
            //                         No Relation Found
            //                     </h3>

            //                     <p className="mt-1 text-sm text-gray-500">
            //                         No subjects match the selected filters.
            //                     </p>

            //                 </div>

            //             )}

            //         </div>

            //     </div>
            // </div>

            // <div
            //     className="w-full p-4"
            //     style={{ backgroundColor: COLORS.latte }}
            // >
            //     <CoPoRelationHeader
            //         setSearchQuery={setSearchQuery}
            //         setFilterYear={setFilterYear}
            //         setFilterCourse={setFilterCourse}
            //         setFilterSemester={setFilterSemester}
            //     />

            //     {/* Table */}
            //     <div className="max-h-125 overflow-y-auto overflow-x-auto border border-gray-200">
            //         {filteredSubjects?.length > 0 ? (
            //             <table className="w-full text-md">
            //                 <thead>
            //                     <tr
            //                         className='text-center border-b border-gray-300'
            //                         style={{
            //                             backgroundColor: COLORS.mint,
            //                             color: COLORS.font
            //                         }}
            //                     >
            //                         <th className='px-3 py-2 w-[15%] text-left'>Subject Code</th>
            //                         <th className='px-3 py-2 w-[30%] text-left'>Subject Name</th>
            //                         <th className='px-3 py-2 w-[15%]'>Academic Year</th>
            //                         <th className='px-3 py-2 w-[10%]'>Semester</th>
            //                         <th className='px-3 py-2 w-[10%]'>Course</th>
            //                         <th className='px-3 py-2 w-[10%]'>Status</th>
            //                         <th className='px-3 py-2 w-[10%]'>Action</th>
            //                     </tr>
            //                 </thead>

            //                 <tbody>
            //                     {filteredSubjects?.map((subject, index) => (
            //                         <tr
            //                             key={index}
            //                             className={`border-b border-gray-200 text-center ${index % 2 === 0
            //                                 ? "bg-[#f1f1f1]"
            //                                 : "bg-[#fafafa]"
            //                                 }`}
            //                         >
            //                             <td className="px-2 py-1 w-[15%] text-left">{subject.subjectId}</td>
            //                             <td className="px-2 py-1 w-[30%] text-left">{subject.subjectName}</td>
            //                             <td className='px-5 py-2 w-[15%]'>{subject.academicYear}</td>
            //                             <td className='px-5 py-2 w-[10%]'>{subject.semester || '-'}</td>
            //                             <td className='px-5 py-2 w-[10%]'>{subject.course}</td>
            //                             <td className='px-5 py-2 w-[10%]'>
            //                                 <div
            //                                     className={`flex items-center gap-2 rounded-full w-full px-3 py-1 text-sm font-medium
            //                                     ${subject.copoMappingStatus === 'Uploaded'
            //                                             ? "bg-green-100 text-green-700"
            //                                             : "bg-amber-100 text-amber-700"
            //                                         }`}
            //                                 >
            //                                     {subject.copoMappingStatus === 'Uploaded' ? (
            //                                         <FaCheckCircle />
            //                                     ) : (
            //                                         <FaClock />
            //                                     )}

            //                                     {subject.copoMappingStatus}
            //                                 </div>
            //                             </td>

            //                             <td className="px-2 py-1">
            //                                 <div className="flex items-center justify-center gap-2">
            //                                     {/* View */}
            //                                     <button
            //                                         className="rounded p-1 transition cursor-pointer"
            //                                         style={{
            //                                             backgroundColor: COLORS.mint,
            //                                             color: COLORS.font
            //                                         }}
            //                                         onClick={() => handleViewOpen(subject)}
            //                                     >
            //                                         <MdRemoveRedEye />
            //                                     </button>
            //                                     {/* Edit */}
            //                                     <button
            //                                         className="rounded p-1 transition cursor-pointer"
            //                                         style={{
            //                                             backgroundColor: COLORS.mint,
            //                                             color: COLORS.font
            //                                         }}
            //                                         onClick={() => handleEditOpen(subject)}
            //                                     >
            //                                         <GrEdit />
            //                                     </button>
            //                                 </div>
            //                             </td>
            //                         </tr>
            //                     ))}
            //                 </tbody>
            //             </table>
            //         ) :
            //             (
            //                 <div className='text-center text-lg'>No data available</div>
            //             )
            //         }
            //     </div>
            // </div>
        ) : <Loading />
    }
    else if (openView && selectedSubjectData) {
        return (
            <ViewCoPoRelation
                data={selectedSubjectData}
                setOpenView={setOpenView}
            />
        )
    }
    else if (openEdit) {
        return (
            <EditCoPoRelation
                data={selectedSubjectData}
                setOpenEdit={setOpenEdit}
            />
        )
    }
    else {
        setOpenView(false);
        setOpenEdit(false);
    }
}

export default CoPoRelation