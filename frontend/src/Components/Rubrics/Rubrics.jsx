import { FaChevronDown, FaChevronRight, FaGraduationCap, FaCalendarAlt, } from "react-icons/fa";
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import axios from 'axios';
import { useSelector } from 'react-redux';
import RubricsHeader from "./RubricsHeader";
import ActionBtns from "../ActionBtns/ActionBtns";
import { Loading } from "../index";
import RubricsViewModal from "./modals/RubricsViewModal";
import RubricsEditModal from "./modals/RubricsEditModal";
import RubricsDeleteModal from "./modals/RubricsDeleteModal";

export default function Rubrics() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggleRubrics, setToggleRubrics] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getData = async () => {
        try {
            const res = await axios.get('/rubrics/');
            setData(res.data.data);
        } catch (error) {
            console.log('Axios Error | Rubcrics | getData(): ', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredData = data.filter(rubric =>
        rubric.course.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(rubric.year).toLowerCase().includes(searchQuery.toLowerCase().trim())
    );


    useEffect(() => {
        getData();
    }, [toggleRubrics]);

    const toggleUpdate = () => {
        setToggleRubrics(prev => !prev)
    }

    return !loading ? (
        <div className="h-full flex flex-col">
            <RubricsHeader
                toggleUpdate={toggleUpdate}
                setSearchQuery={setSearchQuery}
            />
            <div className="flex-1 overflow-y-auto">
                {filteredData?.length > 0 ?
                    (<table className='w-full'>
                        <thead>
                            <tr className='text-center border-b border-gray-300'>
                                <th className='px-5 py-2 w- [10%]'>Course</th>
                                <th className='px-5 py-2 w- [15%]'>Academic Year</th>
                                <th className='px-5 py-2 w- [10%]'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {subjectData?.map(subject => ( */}
                            {filteredData?.map(rubric => (
                                <tr className='text-center border-b border-gray-300' key={rubric._id}>
                                    <td className='px-5 py-2 w- [10%]'>{rubric.course}</td>
                                    <td className='px-5 py-2 w- [15%]'>{rubric.year}</td>
                                    <td className='px-5 py-2 flex items-center justify-center'>
                                        <ActionBtns
                                            data={rubric}
                                            toggleUpdate={toggleUpdate}
                                            ViewModal={RubricsViewModal}
                                            EditModal={RubricsEditModal}
                                            DeleteModal={RubricsDeleteModal}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>) :
                    (
                        <div className='text-center text-lg'>No data available</div>
                    )
                }
            </div>
        </div>
    ) : <Loading />
}

//     if (!data?.length) {
//         return (
//             <div className="flex h-64 items-center justify-center">
//                 <p className="text-slate-500">No threshold configurations found.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6 p-6">
//             {data.map((config) => (
//                 <div
//                     key={config._id}
//                     className="overflow-hidden rounded-xl bg-white shadow-md"
//                 >
//                     {/* Header */}
//                     <div className="border-b bg-slate-50 px-6 py-4">
//                         <div className="flex flex-wrap gap-6">
//                             <div className="flex items-center gap-2">
//                                 <FaGraduationCap className="text-blue-600" />
//                                 <span className="font-medium">
//                                     Course: {config.course}
//                                 </span>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <FaCalendarAlt className="text-blue-600" />
//                                 <span className="font-medium">
//                                     Year: {config.year}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Threshold Table */}
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-blue-600 text-white">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left">Level</th>
//                                     <th className="px-6 py-3 text-left">Min Percentage</th>
//                                     <th className="px-6 py-3 text-left">Max Percentage</th>
//                                     <th className="px-6 py-3 text-left">Range</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {config.thresholds.map((threshold) => (
//                                     <tr
//                                         key={threshold.level}
//                                         className="border-b hover:bg-slate-50"
//                                     >
//                                         <td className="px-6 py-4 font-medium">
//                                             Level {threshold.level}
//                                         </td>

//                                         <td className="px-6 py-4">
//                                             {threshold.minPercent}%
//                                         </td>

//                                         <td className="px-6 py-4">
//                                             {threshold.maxPercent}%
//                                         </td>

//                                         <td className="px-6 py-4 text-slate-600">
//                                             {threshold.minPercent}% - {threshold.maxPercent}%
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Footer */}
//                     <div className="bg-slate-50 px-6 py-3 text-sm text-slate-500">
//                         Updated:{" "}
//                         {new Date(config.updatedAt).toLocaleDateString()}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }

