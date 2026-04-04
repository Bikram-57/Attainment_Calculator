import React from 'react'

function COAttainTable({ data }) {
    console.log(data);
    
    const columns = [
        {
            title: "Quiz 1",
            keys: ["Quiz_1_CO1", "Quiz_1_CO2", "Quiz_1_CO3"],
            total: "Quiz_1_TOTAL",
        },
        {
            title: "Mid Term",
            keys: ["Mid_Term_CO1", "Mid_Term_CO2", "Mid_Term_CO3"],
            total: "Mid_Term_TOTAL",
        },
        {
            title: "Quiz 2",
            keys: ["Quiz_2_CO1", "Quiz_2_CO2", "Quiz_2_CO3"],
            total: "Quiz_2_TOTAL",
        },
        {
            title: "Surprise Quiz",
            keys: ["Surprise_Quiz_CO1", "Surprise_Quiz_CO2", "Surprise_Quiz_CO3"],
            total: "Surprise_Quiz_TOTAL",
        },
        {
            title: "Assignment",
            keys: [
                "Assignment_CO1",
                "Assignment_CO2",
                "Assignment_CO3",
                "Assignment_CO4",
                "Assignment_CO5",
            ],
            total: "Assignment_TOTAL",
        },
        {
            title: "End Sem",
            keys: [
                "End_Sem_CO1",
                "End_Sem_CO2",
                "End_Sem_CO3",
                "End_Sem_CO4",
                "End_Sem_CO5",
            ],
            total: "End_Sem_TOTAL",
        },
    ];

    const { studentMarks, attainmentReport } = data;

    const getCOName = (key) => key.split("_").pop();

    return (
        <div className="p-4">
            <div className="overflow-auto border rounded-lg shadow">
                <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">

                    {/* HEADER */}
                    <thead className="bg-gray-200 sticky top-0 z-10">
                        <tr>
                            <th rowSpan={2} className="border p-2 sticky left-0 bg-gray-200 z-20">
                                Reg No
                            </th>

                            {columns.map((col) => (
                                <th
                                    key={col.title}
                                    colSpan={col.keys.length + 1}
                                    className="border p-2 font-bold"
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>

                        <tr>
                            {columns.map((col) => (
                                <React.Fragment key={col.title}>
                                    {col.keys.map((key) => (
                                        <th key={key} className="border p-2">
                                            {getCOName(key)}
                                        </th>
                                    ))}
                                    <th className="border p-2 font-semibold">Total</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {studentMarks.map((student) => (
                            <tr key={student.regNo} className="hover:bg-gray-50">

                                <td className="border p-2 font-medium sticky left-0 bg-white">
                                    {student.regNo}
                                </td>

                                {columns.map((col) => (
                                    <React.Fragment key={col.title}>

                                        {/* CO Marks */}
                                        {col.keys.map((key) => (
                                            <td key={key} className="border p-2">
                                                {student.marks[key] ?? "-"}
                                            </td>
                                        ))}

                                        {/* TOTAL (FROM BACKEND) */}
                                        <td className="border p-2 font-semibold bg-gray-50">
                                            {student.marks[col.total] ?? "-"}
                                        </td>

                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>

                    {/* FOOTER: Attainment % */}
                    <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                            <td className="border p-2 sticky left-0 bg-gray-100">
                                Target Marks
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {/* CO */}
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.targetMarks ?? 0}
                                        </td>
                                    ))}

                                    {/* TOTAL */}
                                    <td className="border p-2 bg-gray-200">
                                        {attainmentReport[col.total]?.targetMarks ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2 sticky left-0 bg-gray-100">
                                Students {'>'}= 60
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {/* CO */}
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.studentsAboveTarget ?? 0}
                                        </td>
                                    ))}

                                    {/* TOTAL */}
                                    <td className="border p-2 bg-gray-200">
                                        {attainmentReport[col.total]?.studentsAboveTarget ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2 sticky left-0 bg-gray-100">
                                Attainment %
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {/* CO % */}
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.attainmentPercent ?? 0}%
                                        </td>
                                    ))}

                                    {/* TOTAL % */}
                                    <td className="border p-2 bg-gray-200">
                                        {attainmentReport[col.total]?.attainmentPercent ?? 0}%
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2 sticky left-0 bg-gray-100">
                                CO Attainment
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {/* CO */}
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.attainmentLevel ?? 0}
                                        </td>
                                    ))}

                                    {/* TOTAL */}
                                    <td className="border p-2 bg-gray-200">
                                        {attainmentReport[col.total]?.attainmentLevel ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>
                    </tfoot>

                </table>
            </div>
        </div>
    );
};

export default COAttainTable