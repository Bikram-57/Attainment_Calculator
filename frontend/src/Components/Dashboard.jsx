import { useEffect } from "react";
import { FaBookOpen, FaTasks, FaFileAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import axios from 'axios';
import { useState } from "react";

function Dashboard() {
    const [activeSubjectCount, setActiveSubjectCount] = useState([]);
    const [pendingMappingsCount, setPendingMappingsCount] = useState([]);
    const [reportsGeneratedCount, setReportsGeneratedCount] = useState([]);

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

    const recentUploads = [
        {
            file: "CS101_Midterms.xlsx",
            status: "Parsed",
            success: true,
        },
        {
            file: "ME202_Quizzes.xlsx",
            status: "Parsed",
            success: true,
        },
        {
            file: "EE301_Final.xlsx",
            status: "Mapping",
            success: false,
        },
        {
            file: "MCA_2026_Sem2.xlsx",
            status: "Parsed",
            success: true,
        },
    ];

    useEffect(() => {
        const getActiveSubjectsCount = async () => {
            try {
                const res = await axios.get('/home/total-subject');
                setActiveSubjectCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getActiveSubjectsCount || ', error);
            }
        }

        const getPendingMappingsCount = async () => {
            try {
                const res = await axios.get('/home/copo-count');
                setPendingMappingsCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getPendingMappingsCount || ', error);
            }
        }
        const getReportsGeneratedCount = async () => {
            try {
                const res = await axios.get('/home/count');
                setReportsGeneratedCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getReportsGeneratedCount || ', error);
            }
        }
        getActiveSubjectsCount();
        getPendingMappingsCount();
        getReportsGeneratedCount();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <h1 className="mb-4 text-2xl font-bold text-slate-800">
                    Overview
                </h1>

                {/* Stat Cards */}
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
                                    {item.value.map((val) => (
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
                                    ))}
                                </div>

                                {/* {item.type === "subjects" ? (
                                    <div className="space-y-3">
                                        {item.value.map((val) => (
                                            <div
                                                key={val.course}
                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                            >
                                                <span className="font-medium text-slate-700">
                                                    {val.course}
                                                </span>

                                                <span className="text-xl font-bold text-slate-900">
                                                    {val.totalSubjects}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (item.type === "mappings" ? (
                                    <div className="space-y-3">
                                        {item.value.map((val) => (
                                            <div
                                                key={val.course}
                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                            >
                                                <span className="font-medium text-slate-700">
                                                    {val.course}
                                                </span>

                                                <span className="text-xl font-bold text-slate-900">
                                                    {val.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {item.value.map((val) => (
                                            <div
                                                key={val.course}
                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                            >
                                                <span className="font-medium text-slate-700">
                                                    {val.course}
                                                </span>

                                                <span className="text-xl font-bold text-slate-900">
                                                    {val.uploadedCount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))} */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="border-b p-4">
                        <h2 className="text-2xl font-semibold text-slate-800">
                            Recent Activity
                        </h2>
                    </div>

                    <div className="divide-y">
                        {recentUploads.map((upload) => (
                            <div
                                key={upload.file}
                                className="flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <FaFileAlt className="text-slate-500" />

                                    <span className="font-medium text-slate-700">
                                        {upload.file}
                                    </span>
                                </div>

                                <span
                                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium
                                    ${upload.success ?
                                            "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                >
                                    {upload.success ? (
                                        <FaCheckCircle />
                                    ) : (
                                        <FaClock />
                                    )}

                                    {upload.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Dashboard;
