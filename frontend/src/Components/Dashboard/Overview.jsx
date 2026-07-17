import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaBookOpen, FaTasks, FaFileAlt } from "react-icons/fa";

function Overview({ activeSubjectCount, userRole }) {
    // const [activeSubjectCount, setActiveSubjectCount] = useState([]);
    const [pendingMappingsCount, setPendingMappingsCount] = useState([]);
    const [reportsGeneratedCount, setReportsGeneratedCount] = useState([]);

    const adminPendingMappingUrl = '/home/copo-count';
    const facultyPendingMappingUrl = '/user-dashboard/copo';
    const adminReportsGeneratedUrl = '/home/count';
    const facultyReportsGeneratedUrl = '/user-dashboard/generated-count';


    const stats = [
        {
            title: "Active Subjects",
            type: "subjects",
            value: activeSubjectCount,
            icon: <FaBookOpen size={24} />,
            topBar: "bg-blue-500",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pending Mappings",
            type: "mappings",
            value: pendingMappingsCount,
            subtitle: "Requires PO validation",
            icon: <FaTasks size={24} />,
            topBar: "bg-amber-500",
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            title: "Reports Generated",
            value: reportsGeneratedCount,
            icon: <FaFileAlt size={24} />,
            topBar: "bg-green-500",
            bg: "bg-green-50",
            iconColor: "text-green-600",
        },
    ];

    useEffect(() => {
        // const getActiveSubjectsCount = async () => {
        //     try {
        //         const res = await axios.get('/home/total-subject');
        //         setActiveSubjectCount(res.data.data);
        //     } catch (error) {
        //         console.log('ERROR || Dashboard || useEffect || getActiveSubjectsCount || ', error);
        //     }
        // }

        const getPendingMappingsCount = async () => {
            try {
                const url = userRole === 'admin' ? adminPendingMappingUrl : facultyPendingMappingUrl;
                // const url = adminPendingMappingUrl;
                const res = await axios.get(url);
                setPendingMappingsCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getPendingMappingsCount || ', error);
            }
        }

        const getReportsGeneratedCount = async () => {
            try {
                const url = userRole === 'admin' ? adminReportsGeneratedUrl : facultyReportsGeneratedUrl;
                const res = await axios.get(url);
                setReportsGeneratedCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getReportsGeneratedCount || ', error);
            }
        }

        // getActiveSubjectsCount();
        getPendingMappingsCount();
        getReportsGeneratedCount();
    }, []);

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold text-slate-800">
                Overview
            </h1>
            <div className="mb-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.title}
                        className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                    >
                        <div className={`h-2 ${item.topBar}`} />

                        <div className="p-4">
                            <div className="mb-2 flex items-center gap-4">
                                <div
                                    className={`rounded-xl p-3 ${item.bg} ${item.iconColor}`}
                                >
                                    {item.icon}
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800">
                                    {item.title}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {item.value.length > 0 ? (
                                    item.value.map((val) => (
                                        <div
                                            key={val.course}
                                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                        >
                                            <span className="font-medium text-slate-700">
                                                {val.course}
                                            </span>

                                            <span className="text-xl font-bold text-slate-900">
                                                {item.type === 'subjects' ?
                                                    (val.totalSubjects)
                                                    : (item.type === 'mappings' ?
                                                        (val.count)
                                                        : (val.uploadedCount)
                                                    )
                                                }
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No data found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Overview