import { FaChevronDown, FaChevronRight, FaGraduationCap, FaCalendarAlt, } from "react-icons/fa";
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import axios from 'axios';
import { useSelector } from 'react-redux';
import RubricsHeader from "./RubricsHeader";
import { ActionBtns, Loading } from "../index";
import RubricsViewModal from "./modals/RubricsViewModal";
import RubricsEditModal from "./modals/RubricsEditModal";
import RubricsDeleteModal from "./modals/RubricsDeleteModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { COLORS } from "../../constants/theme";

export default function Rubrics() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggleRubrics, setToggleRubrics] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useDocumentTitle('Manage Rubrics');

    const getData = async () => {
        try {
            const res = await axios.get('/rubrics/');
            setData(res.data.data);
        } catch (err) {
            setData([]);
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'No data found!');
            console.log('Axios Error | Rubcrics | getData(): ', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredData = data.filter(rubric =>
        rubric.semesterType.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(rubric.academicYear).toLowerCase().includes(searchQuery.toLowerCase().trim())
    );


    useEffect(() => {
        getData();
    }, [toggleRubrics]);

    const toggleUpdate = () => {
        setToggleRubrics(prev => !prev)
    }

    return !loading ? (
        <div className="flex h-full w-full flex-col">

            <RubricsHeader
                toggleUpdate={toggleUpdate}
                setSearchQuery={setSearchQuery}
            />

            <div className="m-2 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:m-3 lg:m-4">

                {filteredData?.length > 0 ? (

                    <div className="h-full overflow-auto">

                        <table className="min-w-162.5 w-full text-sm">

                            <thead
                                className="sticky top-0 z-2"
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                <tr>

                                    <th className="whitespace-nowrap px-4 py-3 text-center font-semibold sm:px-6">
                                        Semester Type
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-3 text-center font-semibold sm:px-6">
                                        Academic Year
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-3 text-center font-semibold sm:px-6">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredData.map((rubric, index) => (

                                    <tr
                                        key={rubric._id}
                                        className={`border-b border-gray-200 transition hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            }`}
                                    >

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-800 sm:px-6">
                                            {rubric.semesterType}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-700 sm:px-6">
                                            {rubric.academicYear}
                                        </td>

                                        <td className="px-4 py-3 sm:px-6">
                                            <div className="flex justify-center">
                                                <ActionBtns
                                                    data={rubric}
                                                    toggleUpdate={toggleUpdate}
                                                    ViewModal={RubricsViewModal}
                                                    EditModal={RubricsEditModal}
                                                    DeleteModal={RubricsDeleteModal}
                                                />
                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center text-gray-500">

                        <div className="mb-3 text-5xl">
                            📋
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700">
                            No Rubrics Found
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-gray-500">
                            {!searchQuery ?
                                errorMsg
                                : 'There are no rubric records matching your search.'
                            }
                        </p>

                    </div>

                )}

            </div>

            {/* <div className="h-full flex flex-col">
            <RubricsHeader
                toggleUpdate={toggleUpdate}
                setSearchQuery={setSearchQuery}
            />
            <div className="m-3 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">

                {filteredData?.length > 0 ? (
                    <table className="w-full text-sm">

                        <thead
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font,
                            }}
                            className="sticky top-0 z-2"
                        >
                            <tr className="text-center">

                                <th className="px-6 py-3 text-left font-semibold">
                                    Course
                                </th>

                                <th className="px-6 py-3 font-semibold">
                                    Academic Year
                                </th>

                                <th className="px-6 py-3 font-semibold">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {filteredData.map((rubric, index) => (
                                <tr
                                    key={rubric._id}
                                    className={`border-b border-gray-200 transition hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                >

                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        {rubric.course}
                                    </td>

                                    <td className="px-6 py-3 text-center text-gray-700">
                                        {rubric.year}
                                    </td>

                                    <td className="px-6 py-3">
                                        <div className="flex justify-center">
                                            <ActionBtns
                                                data={rubric}
                                                toggleUpdate={toggleUpdate}
                                                ViewModal={RubricsViewModal}
                                                EditModal={RubricsEditModal}
                                                DeleteModal={RubricsDeleteModal}
                                            />
                                        </div>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-500">

                        <div className="mb-2 text-5xl">📋</div>

                        <h3 className="text-lg font-semibold text-gray-700">
                            No Rubrics Found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            There are no rubric records matching your search.
                        </p>

                    </div>
                )}

            </div> */}

            {/* <div className="flex-1 overflow-y-auto">
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
            </div> */}
        </div>
    ) : <Loading />
}
