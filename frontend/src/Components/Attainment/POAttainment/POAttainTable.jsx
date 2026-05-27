import React from "react";

const POAttainTable = ({ data }) => {
    const { averageCo, mappingData, poAttainment, subjectId } = data;

    // Convert CO object → array
    const rows = Object.entries(mappingData);

    // Dynamically extract PO columns (from first CO)
    const poColumns = Object.keys(rows[0][1]); // ["PO1", "PO2", ...]
    const avgCoColumns = Object.entries(averageCo);
    const poAttainmentColumns = Object.entries(poAttainment);
    // console.log(avgCoColumns[0]);
    // console.log(avgCoColumns[0][0]);
    // console.log(avgCoColumns[0][1]);
    // console.log(poAttainmentColumns[0]);


    return (
        <div className="bg-white">
            <div className="overflow-auto shadow">
                <table className="min-w-full text-xs text-center border-collapse whitespace-nowrap">

                    {/* HEADER */}
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border-r border-b border-gray-300 p-2">{subjectId}</th>

                            {poColumns.map((po) => (
                                <th key={po} className="border-r border-b border-gray-300 p-2 font-semibold">
                                    {po}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {/* CO */}
                        {rows.map(([co, values]) => (
                            <tr key={co} className="hover:bg-gray-200">

                                {/* CO Name */}
                                <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-50">
                                    {co}
                                </td>

                                {/* PO Values */}
                                {poColumns.map((po) => (
                                    <td key={po} className="border-r border-b border-gray-300 p-2">
                                        {values[po] !== "" ? values[po] : "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Average CO */}
                        <tr>
                            <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-50">
                                Average CO
                            </td>
                            {/* PO Values */}
                            {avgCoColumns.map(([po, val]) => (
                                <td key={po} className="border-r border-b border-gray-300 p-2">
                                    {val !== '' ? val : '-'}
                                </td>
                            ))}
                        </tr>

                        {/* PO Attainment */}
                        <tr>
                            <td className="border-b border-r border-gray-300 p-2 font-medium bg-gray-50">
                                PO Attainment
                            </td>
                            {/* PO Values */}
                            {poAttainmentColumns.map(([po, val]) => (
                                <td key={po} className="border-r border-b border-gray-300 p-2">
                                    {val !== '' ? val : '-'}
                                </td>
                            ))}
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default POAttainTable;