import React, { useEffect, useState } from 'react'
import { MdRemoveRedEye } from "react-icons/md";
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import { BsSearch } from "react-icons/bs";
import ViewCoPoRelations from './ViewCoPoRelations';
import EditCoPoRelations from './EditCoPoRelations';

function CoPoRelations() {
    const [subjects, setSubjects] = useState(null);
    const [search, setSearch] = useState("");
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedSubjectData, setSelectedSubjectData] = useState(null);
    const [subjectId, setSubjectId] = useState('');

    const fetchData = async (sub) => {
        try {
            const res = await axios.get('/co-po/relation', {
                params: {
                    subjectId: sub.subjectId,
                    academicYear: sub.year,
                    course: sub.course
                }
            });
            setSelectedSubjectData(res.data.mappingData);
            setSubjectId(sub.subjectId);
        } catch (error) {
            console.log('Axios Error | ViewCoPoRelations | fetchData(): ', error);
        }
    }

    const handleViewOpen = async (sub) => {
        await fetchData(sub);
        setOpenView(true);
    }

    const handleEditOpen = (sub) => {
        fetchData(sub);
        setOpenEdit(true);
    }

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



    // const filteredData = subjects.filter(
    //     (item) =>
    //         item.code.toLowerCase().includes(search.toLowerCase()) ||
    //         item.name.toLowerCase().includes(search.toLowerCase())
    // );

    if (!openView && !openEdit) {
        return (
            <div className="w-full bg-white px-3 py-1">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#2f436c]">
                        CO PO Relations
                    </h2>

                    {/* Search */}
                    <div className="flex w-105 overflow-hidden rounded border border-gray-300 bg-white">
                        <input
                            type="text"
                            placeholder="Search by id or name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-1 text-sm outline-none"
                        />

                        <button className="border-l border-gray-300 px-3 text-gray-500 hover:bg-gray-100 cursor-pointer">
                            <BsSearch />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="max-h-125 overflow-y-auto overflow-x-auto border border-gray-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#233b67] text-white">
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
                            {subjects?.map((subject, index) => (
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
                                                className="rounded bg-[#35528d] p-1 text-white transition hover:bg-[#2a4272] cursor-pointer"
                                                onClick={() => handleViewOpen(subject)}
                                            >
                                                <MdRemoveRedEye />
                                            </button>
                                            {/* Edit */}
                                            <button
                                                className="rounded bg-[#35528d] p-1 text-white transition hover:bg-[#2a4272] cursor-pointer"
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
                </div>
            </div>
        );
    }
    else if (openView) {
        return (
            <ViewCoPoRelations
                subjectId={subjectId}
                data={selectedSubjectData}
                setOpenView={setOpenView}
            />
        )
    }
    else {
        return (
            <EditCoPoRelations
                subjectId={subjectId}
                data={selectedSubjectData}
                setOpenEdit={setOpenEdit}
            />
        )
    }
}

export default CoPoRelations