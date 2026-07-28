import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function ProgressCharts({ userRole }) {
    const [progressCharts, setProgressCharts] = useState([]);
    const adminProgressUrls = [
        '/home/progress-BCA',
        '/home/progress-MCA',
        '/home/mapping-progress-BCA',
        '/home/mapping-progress-MCA'
    ];
    const facultyProgressUrls = [
        '/user-dashboard/my-progress/bca',
        '/user-dashboard/my-progress/mca',
        '/user-dashboard/my-copo-progress/bca',
        '/user-dashboard/my-copo-progress/mca'
    ];

    useEffect(() => {
        const fetchProgressCharts = async () => {
            try {
                const [url1, url2, url3, url4] = userRole === 'admin' ? adminProgressUrls : facultyProgressUrls;
                // const [url1, url2, url3, url4] = adminProgressUrls;

                const [
                    bcaProgress,
                    mcaProgress,
                    bcaMapping,
                    mcaMapping
                ] = await Promise.all([
                    axios.get(url1),
                    axios.get(url2),
                    axios.get(url3),
                    axios.get(url4)
                ]);
                setProgressCharts([
                    {
                        title: 'BCA Marks Upload',
                        ...bcaProgress.data.data
                    },
                    {
                        title: 'MCA Marks Upload',
                        ...mcaProgress.data.data
                    },
                    {
                        title: 'BCA CO-PO Mapping',
                        ...bcaMapping.data.data
                    },
                    {
                        title: 'MCA CO-PO Mapping',
                        ...mcaMapping.data.data
                    }
                ]);
            } catch (error) {
                console.log(error);
            }
        };

        fetchProgressCharts();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {progressCharts.map((chart) => (
                <div
                    key={chart.title}
                    className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                    <div className="border-b px-4 py-3 sm:px-5 sm:py-4">
                        <h3 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
                            {chart.title}
                        </h3>
                    </div>

                    {chart.totalSubjects > 0 ? (
                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                            <div className="flex justify-center">
                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                    className="max-w-xs"
                                >
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: "Uploaded",
                                                    value: chart.uploadedSubjects,
                                                },
                                                {
                                                    name: "Pending",
                                                    value: chart.pendingSubjects,
                                                },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={70}
                                            label
                                        >
                                            <Cell fill="#22c55e" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>

                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 space-y-2 text-center">
                                <div className="text-2xl font-bold text-slate-800 sm:text-3xl">
                                    {chart.progressPercentage}%
                                </div>

                                <div className="text-sm text-slate-500 sm:text-base">
                                    {chart.uploadedSubjects} / {chart.totalSubjects} completed
                                </div>

                                <div className="text-xs text-slate-400 sm:text-sm">
                                    Pending: {chart.pendingSubjects}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500 sm:text-base">
                            No data found
                        </div>
                    )}
                </div>
            ))}
        </div>

        // <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        //     {progressCharts.map((chart) => (
        //         <div
        //             key={chart.title}
        //             className="rounded-xl bg-white shadow-sm"
        //         >
        //             <div className="border-b px-4 py-3">
        //                 <h3 className="font-semibold text-slate-800">
        //                     {chart.title}
        //                 </h3>
        //             </div>

        //             {chart.totalSubjects > 0 ? (
        //                 <div className="p-4">
        //                     <ResponsiveContainer width="100%" height={220}>
        //                         <PieChart>
        //                             <Pie
        //                                 data={[
        //                                     {
        //                                         name: 'Uploaded',
        //                                         value: chart.uploadedSubjects,
        //                                     },
        //                                     {
        //                                         name: 'Pending',
        //                                         value: chart.pendingSubjects,
        //                                     },
        //                                 ]}
        //                                 dataKey="value"
        //                                 nameKey="name"
        //                                 outerRadius={70}
        //                                 label
        //                             >
        //                                 <Cell fill="#22c55e" />
        //                                 {/* <Cell fill="#ef4444" /> */}
        //                                 {/* <Cell fill="#eab308" /> */}
        //                                 <Cell fill="#f59e0b" />
        //                             </Pie>

        //                             <Tooltip />
        //                             <Legend />
        //                         </PieChart>
        //                     </ResponsiveContainer>

        //                     <div className="mt-4 space-y-1 text-center">
        //                         <div className="text-2xl font-bold text-slate-800">
        //                             {chart.progressPercentage}%
        //                         </div>

        //                         <div className="text-sm text-slate-500">
        //                             {chart.uploadedSubjects} / {chart.totalSubjects} completed
        //                         </div>

        //                         <div className="text-xs text-slate-400">
        //                             Pending: {chart.pendingSubjects}
        //                         </div>
        //                     </div>
        //                 </div>
        //             ) : (
        //                 <div className="p-6 text-center text-slate-500">
        //                     No data found
        //                 </div>
        //             )}
        //         </div>
        //     ))}
        // </div>
    )
}

export default ProgressCharts