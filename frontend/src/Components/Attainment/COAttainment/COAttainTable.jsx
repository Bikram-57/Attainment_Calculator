import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { close, open } from "../../../store/sideBarSlice";

function COAttainTable({ data }) {
    const dispatch = useDispatch();

    // Handle both:
    // <COAttainTable data={response.data} />
    // and
    // <COAttainTable data={response} />
    const responseData = data?.data ?? data ?? {};

    const studentMarks = responseData?.studentMarks ?? [];
    const attainmentReport = responseData?.attainmentReport ?? {};

    /*
     * Assessment configuration.
     * Only assessment names/prefixes are fixed.
     * CO numbers are completely dynamic.
     */
    const assessmentTypes = [
        {
            title: "Quiz 1",
            prefix: "Quiz_1",
            total: "Quiz_1_TOTAL",
        },
        {
            title: "Mid Term",
            prefix: "Mid_Term",
            total: "Mid_Term_TOTAL",
        },
        {
            title: "Quiz 2",
            prefix: "Quiz_2",
            total: "Quiz_2_TOTAL",
        },
        {
            title: "Surprise Quiz",
            prefix: "Surprise_Quiz",
            total: "Surprise_Quiz_TOTAL",
        },
        {
            title: "Assignment",
            prefix: "Assignment",
            total: "Assignment_TOTAL",
        },
        {
            title: "End Sem",
            prefix: "End_Sem",
            total: "End_Sem_TOTAL",
        },
    ];

    /*
     * ============================================================
     * BUILD COLUMNS PER ASSESSMENT
     * ============================================================
     *
     * IMPORTANT:
     *
     * We DON'T create CO1-CO5 for every assessment.
     *
     * Instead:
     *
     * Quiz_1:
     *   CO1, CO2, CO3
     *
     * Assignment:
     *   CO1, CO2, CO3, CO4, CO5
     *
     * End_Sem:
     *   CO1, CO2, CO3, CO4, CO5
     *
     * based on the actual API fields.
     */
    const columns = useMemo(() => {
        return assessmentTypes.map((assessment) => {
            const coKeys = new Set();

            /*
             * Look at student marks
             */
            studentMarks.forEach((student) => {
                const marks = student?.marks ?? {};

                Object.keys(marks).forEach((key) => {
                    const prefix = `${assessment.prefix}_`;

                    if (key.startsWith(prefix)) {
                        const remaining = key.slice(prefix.length);

                        // Ignore TOTAL
                        if (remaining === "TOTAL") {
                            return;
                        }

                        // Only accept CO<number>
                        if (/^CO\d+$/.test(remaining)) {
                            coKeys.add(remaining);
                        }
                    }
                });
            });

            /*
             * Also look at attainmentReport.
             *
             * This protects against a CO existing in the report
             * but not appearing in a particular student's marks.
             */
            Object.keys(attainmentReport).forEach((key) => {
                const prefix = `${assessment.prefix}_`;

                if (key.startsWith(prefix)) {
                    const remaining = key.slice(prefix.length);

                    if (remaining === "TOTAL") {
                        return;
                    }

                    if (/^CO\d+$/.test(remaining)) {
                        coKeys.add(remaining);
                    }
                }
            });

            /*
             * Sort:
             *
             * CO1
             * CO2
             * CO3
             * CO4
             * CO5
             */
            const sortedCOs = Array.from(coKeys).sort(
                (a, b) =>
                    Number(a.replace("CO", "")) -
                    Number(b.replace("CO", ""))
            );

            return {
                ...assessment,
                keys: sortedCOs.map(
                    (co) => `${assessment.prefix}_${co}`
                ),
            };
        });
    }, [studentMarks, attainmentReport]);

    /*
     * Extract CO name
     *
     * Quiz_1_CO3 -> CO3
     */
    const getCOName = (key) => {
        const match = key.match(/(CO\d+)$/);
        return match ? match[1] : key;
    };

    useEffect(() => {
        dispatch(close());

        return () => dispatch(open());
    }, [dispatch]);

    return (
        <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-full overflow-auto">
                <table className="min-w-full border-separate border-spacing-0 whitespace-nowrap text-sm">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <thead className="sticky top-0 z-30">
                        <tr>
                            <th
                                rowSpan={2}
                                className="sticky left-0 z-40 border-b border-r border-gray-200 bg-slate-800 px-5 py-4 text-left font-semibold text-white"
                            >
                                Reg No
                            </th>

                            {columns.map((col) => (
                                <th
                                    key={col.title}
                                    colSpan={col.keys.length + 1}
                                    className="border-b border-r border-gray-200 bg-slate-800 px-3 py-4 text-center font-semibold text-white"
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>

                        <tr>
                            {columns.map((col) => (
                                <React.Fragment key={col.title}>
                                    {col.keys.map((key) => (
                                        <th
                                            key={key}
                                            className="border-b border-r border-gray-200 bg-slate-700 px-3 py-2 text-xs font-semibold tracking-wide text-white"
                                        >
                                            {getCOName(key)}
                                        </th>
                                    ))}

                                    <th className="border-b border-r border-gray-200 bg-indigo-800 px-3 py-2 text-xs font-bold text-white">
                                        Total
                                    </th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>

                    {/* =====================================================
                        BODY
                    ====================================================== */}

                    <tbody>
                        {studentMarks.length > 0 ? (
                            studentMarks.map((student) => (
                                <tr
                                    key={student.regNo}
                                    className="bg-slate-50 transition-colors hover:bg-indigo-50"
                                >
                                    <td className="sticky left-0 z-20 border-b border-r border-gray-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700">
                                        {student.regNo}
                                    </td>

                                    {columns.map((col) => (
                                        <React.Fragment key={col.title}>

                                            {/* CO MARKS */}
                                            {col.keys.map((key) => (
                                                <td
                                                    key={key}
                                                    className="border-b border-r border-gray-200 px-3 py-3 text-center text-slate-700"
                                                >
                                                    {student?.marks?.[key] ??
                                                        "-"}
                                                </td>
                                            ))}

                                            {/* TOTAL */}
                                            <td className="border-b border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-semibold text-indigo-700">
                                                {student?.marks?.[col.total] ??
                                                    "-"}
                                            </td>

                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        1 +
                                        columns.reduce(
                                            (total, col) =>
                                                total +
                                                col.keys.length +
                                                1,
                                            0
                                        )
                                    }
                                    className="px-5 py-8 text-center text-gray-500"
                                >
                                    No student data available
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* =====================================================
                        FOOTER
                    ====================================================== */}

                    <tfoot>

                        {/* ================= MAX MARKS ================= */}
                        <tr className="bg-slate-100 font-semibold">
                            <td className="sticky left-0 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700">
                                Max Marks
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-3 py-3 text-center"
                                        >
                                            {attainmentReport[key]?.maxMarks ??
                                                0}
                                        </td>
                                    ))}

                                    <td className="border-t border-r border-gray-200 bg-indigo-100 px-3 py-3 text-center font-bold">
                                        {attainmentReport[col.total]
                                            ?.maxMarks ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>

                        {/* ================= TARGET MARKS ================= */}
                        <tr className="bg-white font-semibold">
                            <td className="sticky left-0 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700">
                                Target Marks
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-3 py-3 text-center"
                                        >
                                            {attainmentReport[key]
                                                ?.targetMarks ?? 0}
                                        </td>
                                    ))}

                                    <td className="border-t border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold">
                                        {attainmentReport[col.total]
                                            ?.targetMarks ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>

                        {/* ================= STUDENTS ABOVE TARGET ================= */}
                        <tr className="bg-slate-100 font-semibold">
                            <td className="sticky left-0 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700">
                                Students ≥ Target
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-3 py-3 text-center"
                                        >
                                            {attainmentReport[key]
                                                ?.studentsAboveTarget ?? 0}
                                        </td>
                                    ))}

                                    <td className="border-t border-r border-gray-200 bg-indigo-100 px-3 py-3 text-center font-bold">
                                        {attainmentReport[col.total]
                                            ?.studentsAboveTarget ?? 0}
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>

                        {/* ================= ATTAINMENT % ================= */}
                        <tr className="bg-white font-semibold">
                            <td className="sticky left-0 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700">
                                Attainment %
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-3 py-3 text-center"
                                        >
                                            {attainmentReport[key]
                                                ?.attainmentPercent ?? 0}
                                            %
                                        </td>
                                    ))}

                                    <td className="border-t border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold text-indigo-700">
                                        {attainmentReport[col.total]
                                            ?.attainmentPercent ?? 0}
                                        %
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>

                        {/* ================= CO ATTAINMENT ================= */}
                        <tr className="bg-emerald-50 font-semibold">
                            <td className="sticky left-0 border-t border-r border-gray-200 bg-emerald-50 px-5 py-4 text-slate-800">
                                CO Attainment
                            </td>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-3 py-4 text-center"
                                        >
                                            <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                                {attainmentReport[key]
                                                    ?.attainmentLevel ?? 0}
                                            </span>
                                        </td>
                                    ))}

                                    <td className="border-t border-r border-gray-200 bg-emerald-100 px-3 py-4 text-center">
                                        <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                                            {attainmentReport[col.total]
                                                ?.attainmentLevel ?? 0}
                                        </span>
                                    </td>

                                </React.Fragment>
                            ))}
                        </tr>

                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default COAttainTable;













// import React, { useEffect } from 'react'
// import { useDispatch } from 'react-redux';
// import { close, open } from '../../../store/sideBarSlice';

// function COAttainTable({ data }) {
//     const dispatch = useDispatch();
//     const { studentMarks, attainmentReport } = data;
//     const columns = [
//         {
//             title: "Quiz 1",
//             keys: ["Quiz_1_CO1", "Quiz_1_CO2", "Quiz_1_CO3"],
//             total: "Quiz_1_TOTAL",
//         },
//         {
//             title: "Mid Term",
//             keys: ["Mid_Term_CO1", "Mid_Term_CO2", "Mid_Term_CO3"],
//             total: "Mid_Term_TOTAL",
//         },
//         {
//             title: "Quiz 2",
//             keys: ["Quiz_2_CO1", "Quiz_2_CO2", "Quiz_2_CO3"],
//             total: "Quiz_2_TOTAL",
//         },
//         {
//             title: "Surprise Quiz",
//             keys: ["Surprise_Quiz_CO1", "Surprise_Quiz_CO2", "Surprise_Quiz_CO3"],
//             total: "Surprise_Quiz_TOTAL",
//         },
//         {
//             title: "Assignment",
//             keys: [
//                 "Assignment_CO1",
//                 "Assignment_CO2",
//                 "Assignment_CO3",
//                 "Assignment_CO4",
//                 "Assignment_CO5",
//             ],
//             total: "Assignment_TOTAL",
//         },
//         {
//             title: "End Sem",
//             keys: [
//                 "End_Sem_CO1",
//                 "End_Sem_CO2",
//                 "End_Sem_CO3",
//                 "End_Sem_CO4",
//                 "End_Sem_CO5",
//             ],
//             total: "End_Sem_TOTAL",
//         },
//     ];

//     const getCOName = (key) => key.split("_").pop();
//     // const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
//     useEffect(() => {
//         dispatch(close());
//         return () => dispatch(open());
//     }, []);

//     return (
//         <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

//             {/* Table Container */}
//             <div className="h-full overflow-auto">

//                 <table className="min-w-full border-separate border-spacing-0 text-sm whitespace-nowrap">

//                     {/* ================= HEADER ================= */}
//                     <thead className="sticky top-0 z-30">

//                         <tr>
//                             <th
//                                 rowSpan={2}
//                                 className="sticky left-0 z-40 border-b border-r border-gray-200 bg-slate-800 px-5 py-4 text-left font-semibold text-white"
//                             >
//                                 Reg No
//                             </th>

//                             {columns.map((col) => (
//                                 <th
//                                     key={col.title}
//                                     colSpan={col.keys.length + 1}
//                                     className="border-b border-r border-gray-200 bg-slate-800 px-3 py-4 text-center font-semibold text-white"
//                                 >
//                                     {col.title}
//                                 </th>
//                             ))}
//                         </tr>

//                         <tr>
//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>
//                                     {col.keys.map((key) => (
//                                         <th
//                                             key={key}
//                                             className="border-b border-r border-gray-200 bg-slate-700 px-3 py-2 text-xs font-semibold tracking-wide text-white"
//                                         >
//                                             {getCOName(key)}
//                                         </th>
//                                     ))}

//                                     <th className="border-b border-r border-gray-200 bg-indigo-800 px-3 py-2 text-xs font-bold text-white">
//                                         Total
//                                     </th>
//                                 </React.Fragment>
//                             ))}
//                         </tr>

//                     </thead>

//                     {/* ================= BODY ================= */}
//                     <tbody>

//                         {studentMarks.map((student) => (

//                             <tr
//                                 key={student.regNo}
//                                 className="bg-slate-50 hover:bg-indigo-50 transition-colors"
//                             >

//                                 <td className="sticky left-0 z-20 border-b border-r border-gray-200 bg-inherit px-5 py-3 font-semibold text-slate-700">
//                                     {student.regNo}
//                                 </td>

//                                 {columns.map((col) => (

//                                     <React.Fragment key={col.title}>

//                                         {col.keys.map((key) => (

//                                             <td
//                                                 key={key}
//                                                 className="border-b border-r border-gray-200 px-3 py-3 text-center text-slate-700"
//                                             >
//                                                 {student.marks[key] ?? "-"}
//                                             </td>

//                                         ))}

//                                         <td className="border-b border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-semibold text-indigo-700">
//                                             {student.marks[col.total] ?? "-"}
//                                         </td>

//                                     </React.Fragment>

//                                 ))}

//                             </tr>

//                         ))}

//                     </tbody>

//                     {/* ================= FOOTER ================= */}
//                     <tfoot>

//                         <tr className="bg-slate-100 font-semibold">
//                             <td className="sticky left-0 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700">
//                                 Max Marks
//                             </td>

//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>

//                                     {col.keys.map((key) => (
//                                         <td
//                                             key={key}
//                                             className="border-t border-r border-gray-200 px-3 py-3 text-center"
//                                         >
//                                             {attainmentReport[key]?.maxMarks ?? 0}
//                                         </td>
//                                     ))}

//                                     <td className="border-t border-r border-gray-200 bg-indigo-100 px-3 py-3 text-center font-bold">
//                                         {attainmentReport[col.total]?.maxMarks ?? 0}
//                                     </td>

//                                 </React.Fragment>
//                             ))}
//                         </tr>

//                         <tr className="bg-white font-semibold">
//                             <td className="sticky left-0 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700">
//                                 Target Marks
//                             </td>

//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>

//                                     {col.keys.map((key) => (
//                                         <td
//                                             key={key}
//                                             className="border-t border-r border-gray-200 px-3 py-3 text-center"
//                                         >
//                                             {attainmentReport[key]?.targetMarks ?? 0}
//                                         </td>
//                                     ))}

//                                     <td className="border-t border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold">
//                                         {attainmentReport[col.total]?.targetMarks ?? 0}
//                                     </td>

//                                 </React.Fragment>
//                             ))}
//                         </tr>

//                         <tr className="bg-slate-100 font-semibold">
//                             <td className="sticky left-0 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700">
//                                 Students ≥ Target
//                             </td>

//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>

//                                     {col.keys.map((key) => (
//                                         <td
//                                             key={key}
//                                             className="border-t border-r border-gray-200 px-3 py-3 text-center"
//                                         >
//                                             {attainmentReport[key]?.studentsAboveTarget ?? 0}
//                                         </td>
//                                     ))}

//                                     <td className="border-t border-r border-gray-200 bg-indigo-100 px-3 py-3 text-center font-bold">
//                                         {attainmentReport[col.total]?.studentsAboveTarget ?? 0}
//                                     </td>

//                                 </React.Fragment>
//                             ))}
//                         </tr>

//                         <tr className="bg-white font-semibold">
//                             <td className="sticky left-0 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700">
//                                 Attainment %
//                             </td>

//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>

//                                     {col.keys.map((key) => (
//                                         <td
//                                             key={key}
//                                             className="border-t border-r border-gray-200 px-3 py-3 text-center"
//                                         >
//                                             {attainmentReport[key]?.attainmentPercent ?? 0}%
//                                         </td>
//                                     ))}

//                                     <td className="border-t border-r border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold text-indigo-700">
//                                         {attainmentReport[col.total]?.attainmentPercent ?? 0}%
//                                     </td>

//                                 </React.Fragment>
//                             ))}
//                         </tr>

//                         <tr className="bg-emerald-50 font-semibold">

//                             <td className="sticky left-0 border-t border-r border-gray-200 bg-emerald-50 px-5 py-4 text-slate-800">
//                                 CO Attainment
//                             </td>

//                             {columns.map((col) => (
//                                 <React.Fragment key={col.title}>

//                                     {col.keys.map((key) => (
//                                         <td
//                                             key={key}
//                                             className="border-t border-r border-gray-200 px-3 py-4 text-center"
//                                         >
//                                             <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
//                                                 {attainmentReport[key]?.attainmentLevel ?? 0}
//                                             </span>
//                                         </td>
//                                     ))}

//                                     <td className="border-t border-r border-gray-200 bg-emerald-100 px-3 py-4 text-center">
//                                         <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
//                                             {attainmentReport[col.total]?.attainmentLevel ?? 0}
//                                         </span>
//                                     </td>

//                                 </React.Fragment>
//                             ))}

//                         </tr>

//                     </tfoot>

//                 </table>

//             </div>

//         </div>
//     );
// };

// export default COAttainTable