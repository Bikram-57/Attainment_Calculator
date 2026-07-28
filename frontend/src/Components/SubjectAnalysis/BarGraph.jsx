import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function BarGraph({ data = [], setIsOpen }) {
    const chartData = data.slice(0, 7);

    return (
        <div className="w-full rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b px-4 py-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                    Subject Attainment Analysis
                </h2>

                <button
                    className="w-full sm:w-auto px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </button>
            </div>

            {data.length > 0 ? (
                <div className="p-3 sm:p-4">
                    <div className="w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 10,
                                    left: 5,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="subjectId"
                                    tick={{ fontSize: 12 }}
                                />

                                <YAxis
                                    domain={[0, 3]}
                                    ticks={[0, 1, 2, 3]}
                                    label={{
                                        value: "Attainment Level",
                                        angle: -90,
                                        position: "insideLeft",
                                    }}
                                />

                                <Tooltip
                                    formatter={(value) => [
                                        value.toFixed(2),
                                        "Attainment",
                                    ]}
                                    labelFormatter={(label) => {
                                        const subject = chartData.find(
                                            (s) => s.subjectId === label
                                        );

                                        return `${label} - ${subject?.subjectName || ""}`;
                                    }}
                                />

                                <Bar
                                    dataKey="finalSubjectAttainment"
                                    radius={[6, 6, 0, 0]}
                                    fill="#3b82f6"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center text-base sm:text-lg text-slate-600">
                    No data available
                </div>
            )}
        </div>

        // <div className="rounded-xl bg-white shadow-sm">
        //     <div className="border-b px-4 py-3 flex justify-between items-center">
        //         <h2 className="text-xl font-semibold text-slate-800">
        //             Subject Attainment Analysis
        //         </h2>
        //         <button
        //             className='mt-4 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
        //             onClick={() => setIsOpen(false)}
        //         >
        //             Close
        //         </button>
        //     </div>

        //     {data.length > 0 ? (
        //         <div className="p-4">
        //             <ResponsiveContainer width="100%" height={350}>
        //                 <BarChart
        //                     data={chartData}
        //                     margin={{
        //                         top: 20,
        //                         right: 20,
        //                         left: 10,
        //                         bottom: 20,
        //                     }}
        //                 >
        //                     <CartesianGrid strokeDasharray="3 3" />

        //                     <XAxis
        //                         dataKey="subjectId"
        //                         tick={{ fontSize: 12 }}
        //                     />

        //                     <YAxis
        //                         domain={[0, 3]}
        //                         ticks={[0, 1, 2, 3]}
        //                         label={{
        //                             value: "Attainment Level",
        //                             angle: -90,
        //                             position: "insideLeft",
        //                         }}
        //                     />

        //                     <Tooltip
        //                         formatter={(value) => [
        //                             value.toFixed(2),
        //                             "Attainment",
        //                         ]}
        //                         labelFormatter={(label) => {
        //                             const subject = chartData.find(
        //                                 (s) => s.subjectId === label
        //                             );

        //                             return `${label} - ${subject?.subjectName || ""}`;
        //                         }}
        //                     />

        //                     <Bar
        //                         dataKey="finalSubjectAttainment"
        //                         radius={[6, 6, 0, 0]}
        //                         fill="#3b82f6"
        //                     />
        //                 </BarChart>
        //             </ResponsiveContainer>
        //         </div>
        //     ) : (
        //         <div className='text-center text-lg'>No data available</div>
        //     )}
        // </div>
    );
}

export default BarGraph;