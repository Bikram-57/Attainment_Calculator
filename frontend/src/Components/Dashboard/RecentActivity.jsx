import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FaCheckCircle, FaEdit, FaTrash, FaUpload, FaFileAlt, FaUserPlus } from "react-icons/fa";

function RecentActivity({ activeSubjectCount, userRole }) {
    const [recentActivities, setRecentActivities] = useState([]);
    const adminRecentActivityUrl = '/activity/activities';
    const facultyRecentActivityUrl = '/activity';

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

    useEffect(() => {
        const getRecentActivities = async () => {
            try {
                // const url = userRole !== 'admin' ? adminRecentActivityUrl : facultyRecentActivityUrl;
                const url = adminRecentActivityUrl;
                const res = await axios.get(url);
                setRecentActivities(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getRecentActivities || ', error);
            }
        }

        getRecentActivities();
    }, []);


    return (
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="rounded-xl bg-white shadow-sm lg:col-span-2">
                <div className="border-b px-4 py-3">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Recent Activity
                    </h2>
                </div>

                <div className="max-h-100 overflow-y-auto divide-y">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => {
                            const config = activityConfig[activity.action] || {
                                label: activity.action,
                                className: "bg-gray-100 text-gray-700",
                            };

                            return (
                                <div
                                    key={activity._id}
                                    className="flex flex-col gap-3 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        {getActivityIcon(activity.action)}

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                                                >
                                                    {config.label}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-slate-800">
                                                {activity.target}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                By {activity.actor?.name}
                                            </p>
                                        </div>

                                        <div className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(
                                                activity.timestamp
                                            ).toLocaleString()}
                                        </div>
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
            </div>

            {/* Main Pie Chart */}
            <div className="rounded-xl bg-white shadow-sm">
                <div className="border-b px-4 py-3">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Subject Distribution
                    </h2>
                </div>

                {activeSubjectCount.length > 0 ? (
                    <div className="p-2">
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={activeSubjectCount}
                                    dataKey="totalSubjects"
                                    nameKey="course"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={85}
                                    label={({ course, percent }) =>
                                        `${course} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#22c55e" />
                                </Pie>

                                <Tooltip
                                    formatter={(value) => [
                                        value,
                                        "Subjects"
                                    ]}
                                />

                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-2 space-y-2">
                            {activeSubjectCount.map((item) => (
                                <div
                                    key={item.course}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                >
                                    <span className="font-medium text-slate-700">
                                        {item.course}
                                    </span>

                                    <span className="font-bold text-slate-900">
                                        {item.totalSubjects}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-500">
                        No data found
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecentActivity