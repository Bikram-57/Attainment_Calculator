import React from "react";

const FinalCOAttainmentTable = ({ data }) => {
    const { attainmentTable, finalSubjectAttainment } = data;

    // Convert object → array for mapping
    const rows = Object.entries(attainmentTable);

    // Column configuration
    const columns = [
        { key: "Quiz_1", label: "Quiz 1" },
        { key: "Mid_Term", label: "Sessional 1" },
        { key: "Quiz_2", label: "Quiz 2" },
        { key: "Surprise_Quiz", label: "Sessional 2" },
        { key: "Assignment", label: "Assignment" },
        { key: "externalLevel", label: "End Sem" },
        { key: "internalAvg", label: "Total Avg Int" },
        {
            key: "grandTotal",
            label: "Grand Total (50% int + 50% End term)",
        },
    ];

    return (
        <div className="bg-white">
            <div className="overflow-auto shadow">
                <table className="min-w-full text-sm text-center border-collapse whitespace-nowrap">

                    {/* HEADER */}
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border-r border-b border-gray-300 p-2">CO's</th>

                            {columns.map((col) => (
                                <th key={col.key} className="border-r border-b border-gray-300 p-2 font-semibold">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {rows.map(([co, values]) => (
                            <tr key={co} className="hover:bg-gray-200">

                                {/* CO Name */}
                                <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-100">
                                    {co}
                                </td>

                                {/* Dynamic Columns */}
                                {columns.map((col) => (
                                    <td key={col.key} className="border-r border-b border-gray-300 p-2">
                                        {values[col.key] ?? "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>

                    {/* FOOTER */}
                    <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                            <td
                                colSpan={columns.length}
                                className="border-r border-gray-300 p-2 text-right"
                            >
                                Final CO Attainment
                            </td>

                            <td className="p-2 bg-gray-200 font-bold">
                                {finalSubjectAttainment}
                            </td>
                        </tr>
                    </tfoot>

                </table>
            </div>
        </div>
    );
};

export default FinalCOAttainmentTable;