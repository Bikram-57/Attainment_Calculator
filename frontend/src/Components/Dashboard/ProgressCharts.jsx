import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function ProgressCharts() {
    const [progressCharts, setProgressCharts] = useState([]);

    useEffect(() => {
        const fetchProgressCharts = async () => {
            try {
                const [
                    bcaProgress,
                    mcaProgress,
                    bcaMapping,
                    mcaMapping
                ] = await Promise.all([
                    axios.get('/home/progress-BCA'),
                    axios.get('/home/progress-MCA'),
                    axios.get('/home/mapping-progress-BCA'),
                    axios.get('/home/mapping-progress-MCA')
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {progressCharts.map((chart) => (
                <div
                    key={chart.title}
                    className="rounded-xl bg-white shadow-sm"
                >
                    <div className="border-b px-4 py-3">
                        <h3 className="font-semibold text-slate-800">
                            {chart.title}
                        </h3>
                    </div>

                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'Uploaded',
                                            value: chart.uploadedSubjects,
                                        },
                                        {
                                            name: 'Pending',
                                            value: chart.pendingSubjects,
                                        },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={70}
                                    label
                                >
                                    <Cell fill="#22c55e" />
                                    {/* <Cell fill="#ef4444" /> */}
                                    {/* <Cell fill="#eab308" /> */}
                                    <Cell fill="#f59e0b" />
                                </Pie>

                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-4 space-y-1 text-center">
                            <div className="text-2xl font-bold text-slate-800">
                                {chart.progressPercentage}%
                            </div>

                            <div className="text-sm text-slate-500">
                                {chart.uploadedSubjects} / {chart.totalSubjects} completed
                            </div>

                            <div className="text-xs text-slate-400">
                                Pending: {chart.pendingSubjects}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProgressCharts