import { useEffect } from "react";
// import { FaBookOpen, FaTasks, FaFileAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import { FaBookOpen, FaTasks, FaCheckCircle, FaEdit, FaTrash, FaUpload, FaFileAlt, FaUserPlus } from "react-icons/fa";
import axios from 'axios';
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSelector } from 'react-redux'
function Dashboard() {
    console.log(useSelector(s => s.auth.accessToken))
    const [activeSubjectCount, setActiveSubjectCount] = useState([]);
    const [pendingMappingsCount, setPendingMappingsCount] = useState([]);
    const [reportsGeneratedCount, setReportsGeneratedCount] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

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

    const activityConfig = {
        // Academic & Mapping
        GENERATED_PO_ATTAINMENT: {
            label: "PO Attainment Generated",
            className: "bg-indigo-100 text-indigo-700",
        },
        UPLOADED_CO_PO_MAPPING: {
            label: "CO-PO Mapping Uploaded",
            className: "bg-indigo-100 text-indigo-700",
        },
        GENERATED_DIRECT_PO_BATCH: {
            label: "Direct PO Report Generated",
            className: "bg-indigo-100 text-indigo-700",
        },

        // Rubrics
        UPLOADED_RUBRIC: {
            label: "Rubric Uploaded",
            className: "bg-purple-100 text-purple-700",
        },
        UPDATED_RUBRIC: {
            label: "Rubric Updated",
            className: "bg-purple-100 text-purple-700",
        },
        DELETED_RUBRIC: {
            label: "Rubric Deleted",
            className: "bg-red-100 text-red-700",
        },

        // Subjects
        CREATED_SUBJECT: {
            label: "Subject Created",
            className: "bg-green-100 text-green-700",
        },
        UPDATED_SUBJECT: {
            label: "Subject Updated",
            className: "bg-amber-100 text-amber-700",
        },
        DELETED_SUBJECT: {
            label: "Subject Deleted",
            className: "bg-red-100 text-red-700",
        },
        BATCH_UPLOADED_SUBJECTS: {
            label: "Subjects Uploaded",
            className: "bg-green-100 text-green-700",
        },

        // Faculty
        CREATED_FACULTY_ACCOUNT: {
            label: "Faculty Created",
            className: "bg-blue-100 text-blue-700",
        },
        UPDATED_FACULTY_ACCOUNT: {
            label: "Faculty Updated",
            className: "bg-cyan-100 text-cyan-700",
        },
        DELETED_FACULTY_ACCOUNT: {
            label: "Faculty Deleted",
            className: "bg-red-100 text-red-700",
        },
        ASSIGNED_SUBJECT: {
            label: "Subject Assigned",
            className: "bg-emerald-100 text-emerald-700",
        },
        REMOVED_SUBJECT: {
            label: "Subject Unassigned",
            className: "bg-rose-100 text-rose-700",
        },
    };

    const getActivityIcon = (action) => {
        if (action === "ASSIGNED_SUBJECT") {
            return <FaCheckCircle className="mt-1 text-green-600" />;
        }

        if (action === "REMOVED_SUBJECT") {
            return <FaTrash className="mt-1 text-red-600" />;
        }

        if (action.includes("CREATED")) {
            return <FaCheckCircle className="mt-1 text-green-600" />;
        }

        if (action.includes("UPDATED")) {
            return <FaEdit className="mt-1 text-amber-600" />;
        }

        if (action.includes("DELETED")) {
            return <FaTrash className="mt-1 text-red-600" />;
        }

        if (action.includes("UPLOADED")) {
            return <FaUpload className="mt-1 text-blue-600" />;
        }

        if (action.includes("GENERATED")) {
            return <FaFileAlt className="mt-1 text-indigo-600" />;
        }

        return <FaUserPlus className="mt-1 text-gray-600" />;
    };

    // const recentUploads = [
    //     {
    //         file: "CS101_Midterms.xlsx",
    //         status: "Parsed",
    //         success: true,
    //     },
    //     {
    //         file: "ME202_Quizzes.xlsx",
    //         status: "Parsed",
    //         success: true,
    //     },
    //     {
    //         file: "EE301_Final.xlsx",
    //         status: "Mapping",
    //         success: false,
    //     },
    //     {
    //         file: "MCA_2026_Sem2.xlsx",
    //         status: "Parsed",
    //         success: true,
    //     },
    // ];

    const reportData = [
        { name: "BCA", value: 8 },
        { name: "MCA", value: 3 },
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

        const getRecentActivities = async () => {
            try {
                const res = await axios.get('/activity/activities');
                setRecentActivities(res.data.data);
                console.log(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getRecentActivities || ', error);
            }
        }

        getActiveSubjectsCount();
        getPendingMappingsCount();
        getReportsGeneratedCount();
        getRecentActivities();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mx-auto max-w-7xl overflow-y-auto">
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
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                {/* Recent Activity */}
                <div className="mb-6 rounded-xl bg-white shadow-sm">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Recent Activity
                        </h2>
                    </div>

                    <div className="divide-y">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => {
                                const config = activityConfig[activity.action] || {
                                    label: activity.action
                                        .replaceAll("_", " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                                    className: "bg-gray-100 text-gray-700",
                                };

                                return (
                                    <div
                                        key={activity._id}
                                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            {getActivityIcon(activity.action)}

                                            <div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                                                    >
                                                        {config.label}
                                                    </span>
                                                </div>

                                                <p className="mt-2 font-medium text-slate-800">
                                                    {activity.target}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    By {activity.actor?.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-slate-500">
                                No recent activity found
                            </div>
                        )}
                    </div>

                    {/* <div className="divide-y">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => (
                                <div
                                    key={activity._id}
                                    className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.action === "ASSIGNED_SUBJECT"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {activity.action === "ASSIGNED_SUBJECT"
                                                ? "Assigned"
                                                : "Removed"}
                                        </span>

                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {activity.target}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                By {activity.actor?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-500">
                                No recent activity found
                            </div>
                        )}
                    </div> */}
                </div>

                {/* Pie Chart */}
                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold text-slate-800">
                        Reports by Course
                    </h2>

                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={reportData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label
                            >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#22c55e" />
                            </Pie>

                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>



                {/* <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl bg-white shadow-sm lg:col-span-2">
                        <div className="border-b px-4 py-2">
                            <h2 className="text-xl font-semibold text-slate-800">
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
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${upload.success
                                            ? "bg-green-100 text-green-700"
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

                    <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Reports by Course
                        </h2>

                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={reportData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    label
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#22c55e" />
                                </Pie>

                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default Dashboard;
