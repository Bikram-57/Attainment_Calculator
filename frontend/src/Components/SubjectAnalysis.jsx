import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function SubjectAnalysis() {
    const data = [
        { subject: "CS101", level: 3 },
        { subject: "CS102", level: 2 },
        { subject: "CS103", level: 1 },
        { subject: "CS104", level: 3 },
        { subject: "CS105", level: 2 },
        { subject: "CS106", level: 0 },
        { subject: "CS107", level: 1 },
    ];

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
                PO Attainment Levels
            </h2>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="subject"
                            tick={{ fontSize: 12 }}
                        />

                        <YAxis
                            domain={[0, 3]}
                            ticks={[0, 1, 2, 3]}
                            allowDecimals={false}
                        />

                        <Tooltip />

                        <Bar
                            dataKey="level"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default SubjectAnalysis;