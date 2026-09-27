import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { close, open } from "../../../store/sideBarSlice";

function COAttainLabTable({ data }) {
    const dispatch = useDispatch();

    /*
     * Your API response is:
     *
     * data: {
     *   actualMarks: [...],
     *   reportData: {...}
     * }
     *
     * If your parent is already passing data.data, this also works.
     */
    const labData = data?.data ?? data;

    const studentMarks = labData?.actualMarks ?? [];
    const attainmentReport = labData?.reportData ?? {};

    useEffect(() => {
        dispatch(close());

        return () => dispatch(open());
    }, [dispatch]);

    /*
     * Create:
     *
     * Lab 1
     *   CO1 | CO2 | Total
     *
     * Lab 2
     *   CO1 | CO2 | Total
     *
     * ...
     *
     * Lab 12
     *   CO1 | CO2 | Total
     *
     * End Sem
     *   CO1 | CO2 | Total
     */
    const columns = useMemo(() => {
        const labColumns = Array.from({ length: 12 }, (_, index) => {
            const labNumber = index + 1;

            return {
                title: `Lab ${labNumber}`,
                keys: [
                    `Lab_${labNumber}_CO1`,
                    `Lab_${labNumber}_CO2`,
                ],
                total: `Lab_${labNumber}_Total`,
            };
        });

        return [
            ...labColumns,
            {
                title: "End Sem",
                keys: ["End_Sem_CO1", "End_Sem_CO2"],
                total: "End_Sem_Total",
            },
        ];
    }, []);

    const getCOName = (key) => {
        const parts = key.split("_");
        return parts[parts.length - 1];
    };

    return (
        <div className="h-full min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* ================= TABLE CONTAINER ================= */}
            <div className="h-full min-h-0 overflow-auto">

                <table className="min-w-max border-separate border-spacing-0 text-sm whitespace-nowrap">

                    {/* ================= HEADER ================= */}
                    <thead className="sticky top-0 z-30">

                        {/* Main Header */}
                        <tr>

                            {/* Reg No */}
                            <th
                                rowSpan={2}
                                className="sticky left-0 z-40 min-w-37.5 border-b border-r border-gray-200 bg-slate-800 px-5 py-4 text-left font-semibold text-white"
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

                        {/* CO Header */}
                        <tr>

                            {columns.map((col) => (
                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (
                                        <th
                                            key={key}
                                            className="border-b border-r border-gray-200 bg-slate-700 px-4 py-2 text-xs font-semibold tracking-wide text-white"
                                        >
                                            {getCOName(key)}
                                        </th>
                                    ))}

                                    <th
                                        className="border-b border-r border-gray-200 bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
                                    >
                                        Total
                                    </th>

                                </React.Fragment>
                            ))}

                        </tr>
                    </thead>

                    {/* ================= BODY ================= */}
                    <tbody>

                        {studentMarks.map((student) => (

                            <tr
                                key={student.regNo}
                                className="bg-slate-50 transition-colors hover:bg-indigo-50"
                            >

                                {/* Reg No */}
                                <td
                                    className="sticky left-0 z-20 border-b border-r border-gray-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700"
                                >
                                    {student.regNo}
                                </td>

                                {columns.map((col) => (

                                    <React.Fragment key={col.title}>

                                        {/* CO Marks */}
                                        {col.keys.map((key) => (

                                            <td
                                                key={key}
                                                className="border-b border-r border-gray-200 px-4 py-3 text-center text-slate-700"
                                            >
                                                {student.marks?.[key] ?? "-"}
                                            </td>

                                        ))}

                                        {/* Total */}
                                        <td
                                            className="border-b border-r border-gray-200 bg-indigo-50 px-4 py-3 text-center font-semibold text-indigo-700"
                                        >
                                            {student.marks?.[col.total] ?? "-"}
                                        </td>

                                    </React.Fragment>

                                ))}

                            </tr>

                        ))}

                    </tbody>

                    {/* ================= FOOTER ================= */}
                    <tfoot>

                        {/* Max Marks */}
                        <tr className="bg-slate-100 font-semibold">

                            <td
                                className="sticky left-0 z-20 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700"
                            >
                                Max Marks
                            </td>

                            {columns.map((col) => (

                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (

                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-4 py-3 text-center"
                                        >
                                            {attainmentReport[key]?.maxMarks ?? 0}
                                        </td>

                                    ))}

                                    <td
                                        className="border-t border-r border-gray-200 bg-indigo-100 px-4 py-3 text-center font-bold"
                                    >
                                        {attainmentReport[col.total]?.maxMarks ?? 0}
                                    </td>

                                </React.Fragment>

                            ))}

                        </tr>

                        {/* Target Marks */}
                        <tr className="bg-white font-semibold">

                            <td
                                className="sticky left-0 z-20 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700"
                            >
                                Target Marks
                            </td>

                            {columns.map((col) => (

                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (

                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-4 py-3 text-center"
                                        >
                                            {attainmentReport[key]?.targetMarks ?? 0}
                                        </td>

                                    ))}

                                    <td
                                        className="border-t border-r border-gray-200 bg-indigo-50 px-4 py-3 text-center font-bold"
                                    >
                                        {attainmentReport[col.total]?.targetMarks ?? 0}
                                    </td>

                                </React.Fragment>

                            ))}

                        </tr>

                        {/* Students >= Target */}
                        <tr className="bg-slate-100 font-semibold">

                            <td
                                className="sticky left-0 z-20 border-t border-r border-gray-200 bg-slate-100 px-5 py-3 text-slate-700"
                            >
                                Students ≥ Target
                            </td>

                            {columns.map((col) => (

                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (

                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-4 py-3 text-center"
                                        >
                                            {attainmentReport[key]?.studentsAboveTarget ?? 0}
                                        </td>

                                    ))}

                                    <td
                                        className="border-t border-r border-gray-200 bg-indigo-100 px-4 py-3 text-center font-bold"
                                    >
                                        {attainmentReport[col.total]?.studentsAboveTarget ?? 0}
                                    </td>

                                </React.Fragment>

                            ))}

                        </tr>

                        {/* Attainment % */}
                        <tr className="bg-white font-semibold">

                            <td
                                className="sticky left-0 z-20 border-t border-r border-gray-200 bg-white px-5 py-3 text-slate-700"
                            >
                                Attainment %
                            </td>

                            {columns.map((col) => (

                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (

                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-4 py-3 text-center"
                                        >
                                            {attainmentReport[key]?.attainmentPercent ?? 0}%
                                        </td>

                                    ))}

                                    <td
                                        className="border-t border-r border-gray-200 bg-indigo-50 px-4 py-3 text-center font-bold text-indigo-700"
                                    >
                                        {attainmentReport[col.total]?.attainmentPercent ?? 0}%
                                    </td>

                                </React.Fragment>

                            ))}

                        </tr>

                        {/* CO Attainment */}
                        <tr className="bg-emerald-50 font-semibold">

                            <td
                                className="sticky left-0 z-20 border-t border-r border-gray-200 bg-emerald-50 px-5 py-4 text-slate-800"
                            >
                                CO Attainment
                            </td>

                            {columns.map((col) => (

                                <React.Fragment key={col.title}>

                                    {col.keys.map((key) => (

                                        <td
                                            key={key}
                                            className="border-t border-r border-gray-200 px-4 py-4 text-center"
                                        >
                                            <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                                {attainmentReport[key]?.attainmentLevel ?? 0}
                                            </span>
                                        </td>

                                    ))}

                                    <td
                                        className="border-t border-r border-gray-200 bg-emerald-100 px-4 py-4 text-center"
                                    >
                                        <span className="inline-flex min-w-8.5 justify-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                                            {attainmentReport[col.total]?.attainmentLevel ?? 0}
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

export default COAttainLabTable;