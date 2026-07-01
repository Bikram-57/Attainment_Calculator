import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import { COLORS } from '../../constants/theme';
import { Loading } from '../index';

function Option2() {
    const [searchQuery, setSearchQuery] = useState('');
    const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
    const [updateData, setUpdateData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const currentYear = new Date().getFullYear();

    const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
        (
            sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
            && Object.hasOwn(sub.assignments, filterYear)
        )
    ));

    useEffect(() => {
        const getAssignSubjects = async () => {
            try {
                const res = await axios.get('/assignSub/');
                setAssignedSubjectsData(res.data.data);
            } catch (error) {
                if (error.status == 409) {
                    setErrorMsg('Subject already assigned!');
                }
                else {
                    console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
                }
            } finally {
                setLoading(false);
            }
        }
        getAssignSubjects();
    }, [updateData]);

    const toggleUpdate = () => {
        setUpdateData(prev => !prev);
    }

    const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
        try {
            const res = await axios.delete('/assignSub/', {
                data: {
                    facultyId,
                    subjectId,
                    course,
                    academicYear
                }
            });
            toggleUpdate();
            // console.log(res.data.data);
        } catch (error) {
            console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
        }
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-3">
            {filteredAssignedSubjectsData?.length > 0 ?
                (
                    <div className="space-y-4">
                        {filteredAssignedSubjectsData.map((data) => (
                            <div
                                key={data.facultyId}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                            >
                                <details>
                                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                {data.facultyId} - {data.facultyName}
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                Academic Year: {filterYear}
                                            </p>
                                        </div>

                                        <span
                                            className="rounded-full px-3 py-1 text-sm font-medium"
                                            style={{
                                                backgroundColor: COLORS.latteDark,
                                            }}
                                        >
                                            {
                                                Object.values(
                                                    data.assignments?.[filterYear] || {}
                                                )
                                                    .flat()
                                                    .length
                                            }{" "}
                                            Subjects
                                        </span>
                                    </summary>
                                    <div className="border-t bg-slate-50 p-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {Object.entries(
                                                data.assignments?.[filterYear] || {}
                                            ).map(([course, subjects]) => (
                                                <div
                                                    key={course}
                                                    className="rounded-xl border border-gray-200 bg-white p-3"
                                                >
                                                    <div
                                                        className="mb-3 flex items-center justify-between rounded-lg px-3 py-2"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                    >
                                                        <span className="font-semibold">{course}</span>

                                                        <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                                                            {subjects.length}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {subjects.map((subject) => (
                                                            <div
                                                                key={subject.subjectId}
                                                                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                                                            >
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {subject.subjectId}
                                                                    </div>

                                                                    <div className="text-sm text-slate-500">
                                                                        {subject.subjectName}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                                    onClick={() =>
                                                                        deAssignSubject(
                                                                            subject.subjectId,
                                                                            data.facultyId,
                                                                            course,
                                                                            filterYear
                                                                        )
                                                                    }
                                                                >
                                                                    <RiDeleteBin6Line size={18} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                ) :
                (
                    <div className='text-center text-lg'>No data available</div>
                )
            }
        </div>
    )
}

export default Option2