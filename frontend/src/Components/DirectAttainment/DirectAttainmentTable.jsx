import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { open, close } from '../../store/sideBarSlice';
import { useEffect } from 'react';
import axios from 'axios';
import { COLORS } from '../../constants/theme';

function DirectPOAttainmentTable({ data, setIsOpen }) {
    const dispatch = useDispatch();
    const subjects = data?.subjects || [];

    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const response = await axios.post('/report/direct-po',
                {
                    course: data.course,
                    academicYear: data.academicYear
                },
                {
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = url;
            link.download = `Direct_PO_${data.course}_${data.academicYear.replace(/\//g, '-')}.xlsx`;
            document.body.appendChild(link);

            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Direct PO Report Download Failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        dispatch(close());
        return () => {
            dispatch(open());
        }
    }, []);
    return (
        <div className="flex h-full w-full flex-col rounded-2xl bg-gray-200 p-3 sm:p-4 lg:p-5">

            {/* Header */}
            <div className="mb-4 flex flex-col gap-4 rounded-xl border border-gray-300 bg-gray-100 p-4 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h2
                        className="text-lg font-semibold sm:text-xl"
                        style={{ color: COLORS.mint }}
                    >
                        Direct Attainment Report
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        {data.course} • Batch {data.academicYear}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full rounded-lg border border-gray-400 bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
                    >
                        {downloading ? "Downloading..." : "Download"}
                    </button>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 sm:w-auto cursor-pointer"
                    >
                        Close
                    </button>

                </div>

            </div>

            {/* Subject Tables */}
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">

                {subjects.map((subject, index) => {
                    const rows = subject.tableData || [];

                    const coRows = rows.filter(
                        (row) => row.course !== "Direct PO Attainment"
                    );

                    const directPoRow = rows.find(
                        (row) => row.course === "Direct PO Attainment"
                    );

                    const poColumns = Object.keys(rows[0]).filter((key) =>
                        key.startsWith("PO")
                    );

                    return (
                        <div
                            key={subject.subjectId}
                            className="overflow-hidden rounded-xl border border-gray-300 bg-gray-100 shadow-sm"
                        >

                            {/* Subject Header */}
                            <div
                                className="flex flex-col gap-3 border-b border-gray-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                                style={{ backgroundColor: COLORS.latteDark }}
                            >
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
                                        {subject.subjectName}
                                    </h3>

                                    <p className="text-sm text-gray-600">
                                        {subject.subjectId}
                                    </p>
                                </div>

                                <span
                                    className="w-fit rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{
                                        backgroundColor: COLORS.mint,
                                        color: COLORS.font,
                                    }}
                                >
                                    Subject {subjects.length > 1 ? index + 1 : ""}
                                </span>
                            </div>

                            <div className="overflow-x-auto">

                                <table className="min-w-175 w-full border-collapse text-sm">

                                    <thead
                                        className="sticky top-0 z-10"
                                        style={{
                                            backgroundColor: COLORS.mint,
                                            color: COLORS.font,
                                        }}
                                    >
                                        <tr>

                                            <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                                                CO
                                            </th>

                                            <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                                                Level
                                            </th>

                                            {poColumns.map((po) => (
                                                <th
                                                    key={po}
                                                    className="whitespace-nowrap px-4 py-3 text-center font-semibold"
                                                >
                                                    {po}
                                                </th>
                                            ))}

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {coRows.map((row, index) => (

                                            <tr
                                                key={index}
                                                className="transition odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                                            >

                                                <td className="border-b border-gray-300 px-4 py-3 text-center font-medium whitespace-nowrap">
                                                    {row.co}
                                                </td>

                                                <td className="border-b border-gray-300 px-4 py-3 text-center whitespace-nowrap">
                                                    {row.attainmentLevel}
                                                </td>

                                                {poColumns.map((po) => (
                                                    <td
                                                        key={po}
                                                        className="border-b border-gray-300 px-4 py-3 text-center whitespace-nowrap"
                                                    >
                                                        {row[po] ?? "-"}
                                                    </td>
                                                ))}

                                            </tr>

                                        ))}

                                        {directPoRow && (
                                            <tr
                                                className="font-semibold"
                                                style={{
                                                    backgroundColor: COLORS.latteDark,
                                                }}
                                            >

                                                <td
                                                    colSpan={2}
                                                    className="border-t border-gray-300 px-4 py-3 text-center"
                                                >
                                                    Direct PO Attainment
                                                </td>

                                                {poColumns.map((po) => (
                                                    <td
                                                        key={po}
                                                        className="border-t border-gray-300 px-4 py-3 text-center whitespace-nowrap"
                                                    >
                                                        {directPoRow[po] ?? "-"}
                                                    </td>
                                                ))}

                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>

        // <div className="flex h-full flex-col rounded-xl bg-gray-200 p-4">

        //     {/* Header */}
        //     <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-300 bg-gray-100 px-5 py-3">

        //         <div>
        //             <h2
        //                 className="text-lg font-semibold"
        //                 style={{ color: COLORS.mint }}
        //             >
        //                 Direct Attainment Report
        //             </h2>

        //             <p className="mt-1 text-sm text-gray-600">
        //                 {data.course} • Batch {data.academicYear}
        //             </p>
        //         </div>

        //         <div className="flex items-center gap-3">

        //             <button
        //                 onClick={handleDownload}
        //                 disabled={downloading}
        //                 className="rounded-lg border border-gray-400 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        //             >
        //                 {downloading ? "Downloading..." : "Download"}
        //             </button>

        //             <button
        //                 onClick={() => setIsOpen(false)}
        //                 className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 cursor-pointer"
        //             >
        //                 Close
        //             </button>

        //         </div>

        //     </div>

        //     {/* Subject Tables */}
        //     <div className="flex-1 space-y-4 overflow-y-auto">

        //         {subjects.map((subject, index) => {
        //             const rows = subject.tableData || [];

        //             const coRows = rows.filter(
        //                 (row) => row.course !== "Direct PO Attainment"
        //             );

        //             const directPoRow = rows.find(
        //                 (row) => row.course === "Direct PO Attainment"
        //             );

        //             const poColumns = Object.keys(rows[0]).filter((key) =>
        //                 key.startsWith("PO")
        //             );

        //             return (
        //                 <div
        //                     key={subject.subjectId}
        //                     className="overflow-hidden rounded-xl border border-gray-300 bg-gray-100"
        //                 >

        //                     {/* Subject Header */}
        //                     <div
        //                         className="flex items-center justify-between border-b border-gray-300 px-5 py-3"
        //                         style={{ backgroundColor: COLORS.latteDark }}
        //                     >
        //                         <div>
        //                             <h3 className="font-semibold text-gray-800">
        //                                 {subject.subjectName}
        //                             </h3>

        //                             <p className="text-sm text-gray-600">
        //                                 {subject.subjectId}
        //                             </p>
        //                         </div>

        //                         <span
        //                             className="rounded-full px-3 py-1 text-xs font-semibold"
        //                             style={{
        //                                 backgroundColor: COLORS.mint,
        //                                 color: COLORS.font,
        //                             }}
        //                         >
        //                             Subject {subjects.length > 1 ? index + 1 : ""}
        //                         </span>
        //                     </div>

        //                     <div className="overflow-x-auto">

        //                         <table className="min-w-full border-collapse text-sm">

        //                             <thead
        //                                 style={{
        //                                     backgroundColor: COLORS.mint,
        //                                     color: COLORS.font,
        //                                 }}
        //                             >
        //                                 <tr>

        //                                     <th className="px-4 py-3 text-center font-semibold">
        //                                         CO
        //                                     </th>

        //                                     <th className="px-4 py-3 text-center font-semibold">
        //                                         Level
        //                                     </th>

        //                                     {poColumns.map((po) => (
        //                                         <th
        //                                             key={po}
        //                                             className="px-4 py-3 text-center font-semibold"
        //                                         >
        //                                             {po}
        //                                         </th>
        //                                     ))}

        //                                 </tr>
        //                             </thead>

        //                             <tbody>

        //                                 {coRows.map((row, index) => (

        //                                     <tr
        //                                         key={index}
        //                                         className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200 transition"
        //                                     >

        //                                         <td className="border-b border-gray-300 px-4 py-3 text-center font-medium">
        //                                             {row.co}
        //                                         </td>

        //                                         <td className="border-b border-gray-300 px-4 py-3 text-center">
        //                                             {row.attainmentLevel}
        //                                         </td>

        //                                         {poColumns.map((po) => (
        //                                             <td
        //                                                 key={po}
        //                                                 className="border-b border-gray-300 px-4 py-3 text-center"
        //                                             >
        //                                                 {row[po] ?? "-"}
        //                                             </td>
        //                                         ))}

        //                                     </tr>

        //                                 ))}

        //                                 {directPoRow && (
        //                                     <tr
        //                                         style={{
        //                                             backgroundColor: COLORS.latteDark,
        //                                         }}
        //                                         className="font-semibold"
        //                                     >

        //                                         <td
        //                                             colSpan={2}
        //                                             className="border-t border-gray-300 px-4 py-3 text-center"
        //                                         >
        //                                             Direct PO Attainment
        //                                         </td>

        //                                         {poColumns.map((po) => (
        //                                             <td
        //                                                 key={po}
        //                                                 className="border-t border-gray-300 px-4 py-3 text-center"
        //                                             >
        //                                                 {directPoRow[po] ?? "-"}
        //                                             </td>
        //                                         ))}

        //                                     </tr>
        //                                 )}

        //                             </tbody>

        //                         </table>

        //                     </div>

        //                 </div>
        //             );
        //         })}

        //     </div>

        // </div>

        // <div className="flex h-full flex-col rounded-xl bg-gray-100 p-4">

        //     {/* Header */}
        //     <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">

        //         <div>
        //             <h2
        //                 className="text-lg font-semibold"
        //                 style={{ color: COLORS.mint }}
        //             >
        //                 Direct Attainment Report
        //             </h2>

        //             <p className="mt-1 text-sm text-gray-500">
        //                 {data.course} • Batch {data.academicYear}
        //             </p>
        //         </div>

        //         <div className="flex items-center gap-3">

        //             <button
        //                 onClick={handleDownload}
        //                 disabled={downloading}
        //                 className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        //             >
        //                 {downloading ? "Downloading..." : "Download"}
        //             </button>

        //             <button
        //                 onClick={() => setIsOpen(false)}
        //                 className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 cursor-pointer"
        //             >
        //                 Close
        //             </button>

        //         </div>

        //     </div>

        //     {/* Tables */}
        //     <div className="flex-1 space-y-5 overflow-y-auto">

        //         {subjects.map((subject, index) => {
        //             const rows = subject.tableData || [];

        //             const coRows = rows.filter(
        //                 (row) => row.course !== "Direct PO Attainment"
        //             );

        //             const directPoRow = rows.find(
        //                 (row) => row.course === "Direct PO Attainment"
        //             );

        //             const poColumns = Object.keys(rows[0]).filter((key) =>
        //                 key.startsWith("PO")
        //             );

        //             return (
        //                 <div
        //                     key={subject.subjectId}
        //                     className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        //                 >

        //                     {/* Subject Header */}
        //                     <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">

        //                         <div>
        //                             <h3 className="font-semibold text-gray-800">
        //                                 {subject.subjectName}
        //                             </h3>

        //                             <p className="text-sm text-gray-500">
        //                                 {subject.subjectId}
        //                             </p>
        //                         </div>

        //                         <span
        //                             className="rounded-full px-3 py-1 text-xs font-semibold"
        //                             style={{
        //                                 backgroundColor: COLORS.latteDark,
        //                                 color: COLORS.mintDark,
        //                             }}
        //                         >
        //                             Subject {subjects.length > 1 ? index + 1 : ""}
        //                         </span>

        //                     </div>

        //                     <div className="overflow-x-auto">

        //                         <table className="min-w-full border-collapse text-sm">

        //                             <thead className="bg-gray-100">

        //                                 <tr className="text-center text-gray-700">

        //                                     <th className="border-b border-gray-200 px-4 py-3">
        //                                         CO
        //                                     </th>

        //                                     <th className="border-b border-gray-200 px-4 py-3">
        //                                         Level
        //                                     </th>

        //                                     {poColumns.map((po) => (
        //                                         <th
        //                                             key={po}
        //                                             className="border-b border-gray-200 px-4 py-3"
        //                                         >
        //                                             {po}
        //                                         </th>
        //                                     ))}

        //                                 </tr>

        //                             </thead>

        //                             <tbody>

        //                                 {coRows.map((row, index) => (

        //                                     <tr
        //                                         key={index}
        //                                         className="border-b border-gray-100 transition hover:bg-gray-50"
        //                                     >

        //                                         <td className="px-4 py-3 text-center font-medium">
        //                                             {row.co}
        //                                         </td>

        //                                         <td className="px-4 py-3 text-center">
        //                                             {row.attainmentLevel}
        //                                         </td>

        //                                         {poColumns.map((po) => (
        //                                             <td
        //                                                 key={po}
        //                                                 className="px-4 py-3 text-center"
        //                                             >
        //                                                 {row[po] ?? "-"}
        //                                             </td>
        //                                         ))}

        //                                     </tr>

        //                                 ))}

        //                                 {directPoRow && (
        //                                     <tr className="bg-gray-100 font-semibold">

        //                                         <td
        //                                             colSpan={2}
        //                                             className="border-t border-gray-200 px-4 py-3 text-center"
        //                                         >
        //                                             Direct PO Attainment
        //                                         </td>

        //                                         {poColumns.map((po) => (
        //                                             <td
        //                                                 key={po}
        //                                                 className="border-t border-gray-200 px-4 py-3 text-center"
        //                                             >
        //                                                 {directPoRow[po] ?? "-"}
        //                                             </td>
        //                                         ))}

        //                                     </tr>
        //                                 )}

        //                             </tbody>

        //                         </table>

        //                     </div>

        //                 </div>
        //             );
        //         })}

        //     </div>

        // </div>

        // <div className="bg-white p-4">
        //     <div className='font-semibold text-lg pb-3 flex justify-between items-center'>
        //         <div className='flex items-center gap-5'>
        //             <div>
        //                 Direct Attainment: {data.course} - {data.academicYear}
        //             </div>
        //             <button
        //                 className='border px-2 py-1 rounded-md cursor-pointer text-sm disabled:cursor-not-allowed'
        //                 onClick={handleDownload}
        //                 disabled={downloading}
        //             >
        //                 {!downloading ? 'Download' : 'Downloading...'}
        //             </button>
        //         </div>
        //         <button
        //             className='px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer'
        //             onClick={() => setIsOpen(false)}
        //         >
        //             Close
        //         </button>
        //     </div>
        //     <div className="space-y-8 overflow-y-auto max-h-[70vh]">
        //         {subjects.map((subject, index) => {
        //             const rows = subject.tableData || [];

        //             const coRows = rows.filter(
        //                 (row) => row.course !== "Direct PO Attainment"
        //             );

        //             const directPoRow = rows.find(
        //                 (row) => row.course === "Direct PO Attainment"
        //             );

        //             const poColumns = Object.keys(rows[0]).filter((key) =>
        //                 key.startsWith("PO")
        //             );

        //             return (
        //                 <div key={subject.subjectId} className="overflow-x-auto">
        //                     <table className="w-full border-collapse text-center">
        //                         <thead>
        //                             <tr>
        //                                 <th className="border p-3 bg-gray-200">
        //                                     Subject {subjects.length > 1 ? `(${index + 1})` : null}
        //                                 </th>
        //                                 <th className="border p-3 bg-gray-200">
        //                                     CO
        //                                 </th>
        //                                 <th className="border p-3 bg-gray-200">
        //                                     Attainment Level
        //                                 </th>

        //                                 {poColumns.map((po) => (
        //                                     <th
        //                                         key={po}
        //                                         className="border p-3 bg-gray-200"
        //                                     >
        //                                         {po}
        //                                     </th>
        //                                 ))}
        //                             </tr>
        //                         </thead>

        //                         <tbody>
        //                             {coRows.map((row, index) => (
        //                                 <tr key={index} className='hover:bg-gray-100'>
        //                                     {index === 0 && (
        //                                         <td
        //                                             rowSpan={coRows.length}
        //                                             className="border p-3 font-semibold align-top bg-white w-1/4"
        //                                         >
        //                                             {subject.subjectName}
        //                                             <br />
        //                                             ({subject.subjectId})
        //                                         </td>
        //                                     )}

        //                                     <td className="border p-3">
        //                                         {row.co}
        //                                     </td>

        //                                     <td className="border p-3">
        //                                         {row.attainmentLevel}
        //                                     </td>

        //                                     {poColumns.map((po) => (
        //                                         <td
        //                                             key={po}
        //                                             className="border p-3"
        //                                         >
        //                                             {row[po] ?? "-"}
        //                                         </td>
        //                                     ))}
        //                                 </tr>
        //                             ))}

        //                             {/* Direct PO Attainment Row */}
        //                             {directPoRow && (
        //                                 <tr className="font-semibold bg-gray-200 hover:bg-gray-300">
        //                                     <td
        //                                         colSpan={3}
        //                                         className="border p-3 text-center bg-gray-300"
        //                                     >
        //                                         Direct PO Attainment
        //                                     </td>

        //                                     {poColumns.map((po) => (
        //                                         <td
        //                                             key={po}
        //                                             className="border p-3"
        //                                         >
        //                                             {directPoRow[po] ?? "-"}
        //                                         </td>
        //                                     ))}
        //                                 </tr>
        //                             )}
        //                         </tbody>
        //                     </table>
        //                 </div>
        //             );
        //         })}
        //     </div>
        // </div>
    );
}

export default DirectPOAttainmentTable;
