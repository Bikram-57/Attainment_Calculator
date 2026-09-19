import React, { useEffect, useState } from 'react'
import { MdRemoveRedEye, MdUploadFile } from "react-icons/md";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import ViewCoPoRelation from './ViewCoPoRelation';
import EditCoPoRelation from './EditCoPoRelation';
import { COLORS } from '../../constants/theme'
import { CoPoRelationHeader, Loading, UploadCoPoRelation } from '../index';
import { useSelector } from 'react-redux';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function CoPoRelation() {
    const userData = useSelector(state => state.auth.userData);
    const currentYear = new Date().getFullYear();

    const [subjects, setSubjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);
    const [selectedSubjectData, setSelectedSubjectData] = useState(null);
    const [selectedSubjectDataForUpload, setSelectedSubjectDataForUpload] = useState({})
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(currentYear);
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
        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.log('Axios Error | ViewCoPoRelation | fetchSelectedCoPoData(): ', err);
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

    const handleUploadOpen = (sub) => {
        setSelectedSubjectDataForUpload({
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            academicYear: sub.academicYear,
            course: sub.course,
            semester: sub.semester
        });
        setOpenUpload(true);
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
            setLoading(true);
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
            } catch (err) {
                setSubjects([])
                console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
                console.log('Axios Error | CoPoRelation | fetchCoPoSubjectList(): ', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCoPoSubjectList();
    }, [filterYear]);

    if (!openView && !openEdit && !openUpload) {
        return !loading ? (
            <div
                className="flex h-full w-full flex-col rounded-2xl border border-gray-200 shadow-sm"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <CoPoRelationHeader
                    setSearchQuery={setSearchQuery}
                    filterYear={filterYear}
                    filterCourse={filterCourse}
                    filterSemester={filterSemester}
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
                                                        className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
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
                                                        className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                        title="Edit Mapping"
                                                    >
                                                        <GrEdit size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleUploadOpen(subject)}
                                                        className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                        title="Upload Mapping"
                                                    >
                                                        <MdUploadFile size={17} />
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
    else if (openUpload) {
        return (
            <UploadCoPoRelation
                data={selectedSubjectDataForUpload}
                setOpenUpload={setOpenUpload}
            />
        )
    }
    else {
        setOpenView(false);
        setOpenEdit(false);
        setOpenUpload(false);
    }
}

export default CoPoRelation