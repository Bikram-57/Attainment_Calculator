import React, { useEffect, useState } from 'react'
import { MdRemoveRedEye } from "react-icons/md";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import { BsSearch } from "react-icons/bs";
import ViewCoPoRelation from './ViewCoPoRelation';
import EditCoPoRelation from './EditCoPoRelation';
import { COLORS } from '../../constants/theme'
import Loading from '../Loading';

function CoPoRelation() {
    const [subjects, setSubjects] = useState(null);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedSubjectData, setSelectedSubjectData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (sub) => {
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
            console.log('Axios Error | ViewCoPoRelation | fetchData(): ', error);
        } finally {
            setLoading(false);
        }
    }

    const handleViewOpen = async (sub) => {
        setLoading(true);
        await fetchData(sub);
        setOpenView(true);
    }

    const handleEditOpen = async (sub) => {
        setLoading(true);
        await fetchData(sub);
        setOpenEdit(true);
    }

    const handleChange = (e) => {
        if (e.target.value == '') {
            setSearchQuery('');
        }
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    }

    const filteredSubjects = subjects?.filter(sub => (
        sub.subjectId.toLowerCase().includes(searchQuery.toLowerCase().trim())
        || sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    ));

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get('/sub/');
                setSubjects(res.data.data);
                console.log(res.data.data);
            } catch (error) {
                console.log('Axios Error | CoPoRelation | fetchSubjects(): ', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, []);

    if (!openView && !openEdit) {
        return !loading ? (
            <div
                className="w-full p-4"
                style={{ backgroundColor: COLORS.latte }}
            >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.mint }}
                    >
                        CO PO Relations
                    </h2>

                    {/* Search */}
                    <div
                        className="flex w-105 overflow-hidden rounded-md border"
                    // style={{ borderColor: COLORS.mintDark }}
                    >
                        <input
                            type="text"
                            placeholder="Search by subject Id or name"
                            value={search}
                            onChange={(e) => handleChange(e)}
                            className="w-full border-r px-3 py-1 text-sm outline-none"
                            style={{
                                // borderRightColor: COLORS.mintDark,
                                color: COLORS.mintDark
                            }}
                        />

                        <button className="px-3 cursor-pointer">
                            <BsSearch
                                onClick={() => setSearchQuery(search)}
                                style={{ color: COLORS.mintDark }}
                            />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="max-h-125 overflow-y-auto overflow-x-auto border border-gray-200">
                    {filteredSubjects?.length > 0 ? (
                        <table className="w-full text-md">
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: COLORS.mint,
                                        color: COLORS.font
                                    }}
                                >
                                    <th className="px-2 py-1 text-left font-semibold w-[20%]">
                                        Subject Code
                                    </th>

                                    <th className="px-2 py-1 text-left font-semibold w-[40%]">
                                        Subject Name
                                    </th>

                                    <th className="px-2 py-1 text-center font-semibold w-[25%]">
                                        Status
                                    </th>

                                    <th className="px-2 py-1 text-center font-semibold w-[15%]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSubjects?.map((subject, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-gray-200 ${index % 2 === 0
                                            ? "bg-[#f1f1f1]"
                                            : "bg-[#fafafa]"
                                            }`}
                                    >
                                        <td className="px-2 py-1 text-gray-700">
                                            {subject.subjectId}
                                        </td>

                                        <td className="px-2 py-1 text-gray-700">
                                            {subject.subjectName}
                                        </td>

                                        <td className='px-5 py-2 m-auto flex justify-center w-1/2'>
                                            <div
                                                className={`flex items-center gap-2 rounded-full w-full px-3 py-1 text-sm font-medium
                                                ${subject.copoMappingStatus === 'Uploaded'
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                    }`}
                                            >
                                                {subject.copoMappingStatus === 'Uploaded' ? (
                                                    <FaCheckCircle />
                                                ) : (
                                                    <FaClock />
                                                )}

                                                {subject.copoMappingStatus}
                                            </div>
                                        </td>

                                        <td className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View */}
                                                <button
                                                    className="rounded p-1 transition cursor-pointer"
                                                    style={{
                                                        backgroundColor: COLORS.mint,
                                                        color: COLORS.font
                                                    }}
                                                    onClick={() => handleViewOpen(subject)}
                                                >
                                                    <MdRemoveRedEye />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    className="rounded p-1 transition cursor-pointer"
                                                    style={{
                                                        backgroundColor: COLORS.mint,
                                                        color: COLORS.font
                                                    }}
                                                    onClick={() => handleEditOpen(subject)}
                                                >
                                                    <GrEdit />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) :
                        (
                            <div className='text-center text-lg'>No data available</div>
                        )
                    }
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
    // else if (openEdit && selectedSubjectData) {
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