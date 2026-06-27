import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function BarGraph({ data = [] }) {
    const chartData = data.slice(0, 7);

    return (
        <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b px-4 py-3">
                <h2 className="text-xl font-semibold text-slate-800">
                    Subject Attainment Analysis
                </h2>
            </div>

            <div className="p-4">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 10,
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
    );
}

export default BarGraph;