import React from 'react'

function COAttainTable({ data }) {
    const columns = [
        {
            title: "Quiz 1",
            keys: ["Quiz_1_CO1", "Quiz_1_CO2", "Quiz_1_CO3"],
        },
        {
            title: "Mid Term",
            keys: ["Mid_Term_CO1", "Mid_Term_CO2", "Mid_Term_CO3"],
        },
        {
            title: "Quiz 2",
            keys: ["Quiz_2_CO1", "Quiz_2_CO2", "Quiz_2_CO3"],
        },
        {
            title: "Surprise Quiz",
            keys: ["Surprise_Quiz_CO1", "Surprise_Quiz_CO2", "Surprise_Quiz_CO3"],
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
        },
    ];

    const { studentMarks, attainmentReport } = data;

    const getCOName = (key) => key.split("_").pop();
// remove 46 - 51
    const getTotal = (marks, keys) =>
        keys.reduce((sum, key) => sum + (marks[key] || 0), 0);

    // const getAttainTotal = (report, keys, subKey) =>
    //     keys.reduce((sum, key) => sum + (report[key][subKey] || 0), 0);

    return (
        <div className="p-4">
            <div className="overflow-auto border rounded-lg">
                <table className="min-w-full text-sm text-center border-collapse">

                    {/* HEADER 1 */}
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2" rowSpan={2}>Reg No</th>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="border p-2"
                                    colSpan={col.keys.length + 1}
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>

                        {/* HEADER 2 */}
                        <tr>
                            {columns.map((col, i) =>
                                <>
                                    {col.keys.map((key) => (
                                        <th key={key} className="border p-2">
                                            {getCOName(key)}
                                        </th>
                                    ))}
                                    <th key={i} className="border p-2">Total</th>
                                </>
                            )}
                            {/* {columns.map((_, i) => (
                                <th key={i} className="border p-2">Total</th>
                            ))} */}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {studentMarks.map((student) => (
                            <tr key={student.regNo} className="hover:bg-gray-50">
                                <td className="border p-2 font-medium">
                                    {student.regNo}
                                </td>

                                {columns.map((col) => (
                                    <>
                                        {col.keys.map((key) => (
                                            <td key={key} className="border p-2">
                                                {student.marks[key] ?? "-"}
                                            </td>
                                        ))}

                                        {/* remove 109 */}
                                        <td className="border p-2 font-semibold">
                                            {getTotal(student.marks, col.keys)}
                                        </td>
                                    </>
                                ))}
                            </tr>
                        ))}
                    </tbody>

                    {/* FOOTER (Attainment %) */}
                    <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                            <td className="border p-2">Attainment %</td>

                            {columns.map((col) => (
                                <>
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.attainmentPercent || 0}%
                                        </td>
                                    ))}

                                    
                                    <td className="border p-2">
                                        {Math.round(
                                            col.keys.reduce(
                                                (sum, key) =>
                                                    sum +
                                                    (attainmentReport[key]?.attainmentPercent || 0),
                                                0
                                            ) / col.keys.length
                                        )}
                                        %
                                    </td>
                                </>
                            ))}
                        </tr>
                        {/* <tr>
                            <td className="border p-2">Target Marks</td>

                            {columns.map((col) => (
                                <>
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.targetMarks || 0}
                                        </td>
                                    ))}


                                    <td className="border p-2">
                                        {getAttainTotal(attainmentReport, col.keys, 'targetMarks')}
                                    </td>
                                </>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2">Students {'>'}= 60%</td>

                            {columns.map((col) => (
                                <>
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.studentsAboveTarget || 0}
                                        </td>
                                    ))}


                                    <td className="border p-2">
                                        {getAttainTotal(attainmentReport, col.keys, 'studentsAboveTarget')}
                                    </td>
                                </>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2">Attainment %</td>

                            {columns.map((col) => (
                                <>
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.attainmentPercent || 0}%
                                        </td>
                                    ))}

                                    
                                    <td className="border p-2">
                                        {Math.round(
                                            col.keys.reduce(
                                                (sum, key) =>
                                                    sum +
                                                    (attainmentReport[key]?.attainmentPercent || 0),
                                                0
                                            ) / col.keys.length
                                        )}
                                        %
                                    </td>
                                </>
                            ))}
                        </tr>
                        <tr>
                            <td className="border p-2">CO Attainment</td>

                            {columns.map((col) => (
                                <>
                                    {col.keys.map((key) => (
                                        <td key={key} className="border p-2">
                                            {attainmentReport[key]?.attainmentLevel || 0}
                                        </td>
                                    ))}


                                    <td className="border p-2">
                                        {getAttainTotal(attainmentReport, col.keys, 'attainmentLevel')}
                                    </td>
                                </>
                            ))}
                        </tr> */}
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default COAttainTable