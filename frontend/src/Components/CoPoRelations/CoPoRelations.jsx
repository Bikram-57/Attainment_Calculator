import React, { useEffect, useState } from 'react'
import { MdRemoveRedEye } from "react-icons/md";
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import { BsSearch } from "react-icons/bs";
import ViewCoPoRelations from './ViewCoPoRelations';
import EditCoPoRelations from './EditCoPoRelations';
import { COLORS } from '../../constants/theme'

function CoPoRelations() {
    const [subjects, setSubjects] = useState(null);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedSubjectData, setSelectedSubjectData] = useState(null);

    const fetchData = async (sub) => {
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
            console.log('Axios Error | ViewCoPoRelations | fetchData(): ', error);
            setSelectedSubjectData(null);
            alert("Data not available!");
        }
    }

    const handleViewOpen = async (sub) => {
        await fetchData(sub);
        setOpenView(true);
    }

    const handleEditOpen = async (sub) => {
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
        sub.subjectId.toLowerCase().includes(searchQuery.toLowerCase()) || sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    )) || subjects;

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get('/sub/');
                setSubjects(res.data.data);
            } catch (error) {
                console.log('Axios Error | CoPoRelations | fetchSubjects(): ', error);
            }
        }
        fetchSubjects();
    }, []);

    if (!openView && !openEdit) {
        return (
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
                            placeholder="Search by id or name"
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
                                    <th className="px-2 py-1 text-left font-semibold">
                                        Subject Code
                                    </th>

                                    <th className="px-2 py-1 text-left font-semibold">
                                        Subject Name
                                    </th>

                                    <th className="px-2 py-1 text-center font-semibold w-35">
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
        );
    }
    else if (openView && selectedSubjectData) {
        return (
            <ViewCoPoRelations
                data={selectedSubjectData}
                setOpenView={setOpenView}
            />
        )
    }
    else if (openEdit && selectedSubjectData) {
        return (
            <EditCoPoRelations
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

export default CoPoRelations