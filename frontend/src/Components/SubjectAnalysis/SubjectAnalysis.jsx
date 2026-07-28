import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { MdOutlineCancelPresentation } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { COLORS } from '../../constants/theme';
import { ErrorSuccessMsg } from '../index';
import { Loading } from '../index';
import Select from "react-select";
import BarGraph from './BarGraph';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function SubjectAnalysis() {
    const [course, setCourse] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [semester, setSemester] = useState('')
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [graphData, setGraphData] = useState([]);

    const currentYear = new Date().getFullYear();
    const yearList = [2024];
    const semesterList = [];

    useDocumentTitle('Subject Analysis');

    for (let year = yearList[0] + 1; year <= currentYear; year++) {
        yearList.push(year);
    }

    for (let i = 1; i <= 8; i++) {
        semesterList.push(i);
    }

    const yearOptions = yearList.map((year) => (
        {
            value: year,
            label: year,
        }
    ));

    const courseOptions = [
        { value: "BCA", label: "BCA" },
        { value: "MCA", label: "MCA" },
    ];

    const semesterOptions = semesterList.map(sem => (
        {
            value: sem,
            label: sem
        }
    ));

    const handleSubmit = async () => {
        if (!semester || !academicYear || !course) {
            setErrorMsg("Please fill all the fields");
            return;
        }

        setErrorMsg('');
        try {
            const res = await axios.get('/subject-analysis/', {
                params: {
                    course,
                    academicYear,
                    semester
                }
            });
            setGraphData(res.data.data);
            setIsOpen(true);
            setAcademicYear('');
            setCourse('');
            setSemester('');
            console.log(res);
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Something went wrong!');
            console.log("Error on handleSubmit || ", err);
        }
    }

    return !isOpen ? (
        <div
            className="flex h-1/2 w-full flex-col rounded-2xl border border-gray-200 bg-transparent p-4 sm:p-5 lg:p-6"
            style={{ backgroundColor: COLORS.latte }}
        >
            {/* Header */}
            <div className="mb-6">
                <h2
                    className="text-xl font-semibold sm:text-2xl"
                    style={{ color: COLORS.mintDark }}
                >
                    Subject Analysis
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
                    Select the academic year, course, and semester to generate the
                    subject-wise analysis.
                </p>
            </div>

            {/* Form Card */}
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {/* Academic Year */}
                    <div className="min-w-0">
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Academic Year
                        </label>

                        <Select
                            options={yearOptions}
                            placeholder="Select year"
                            value={yearList.find(option => option.value === academicYear)}
                            onChange={selected => setAcademicYear(selected?.value || "")}
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Course */}
                    <div className="min-w-0">
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Course
                        </label>

                        <Select
                            options={courseOptions}
                            placeholder="Select course"
                            value={courseOptions.find(option => option.value === course)}
                            onChange={selected => setCourse(selected?.value || "")}
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Semester */}
                    <div className="min-w-0">
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Semester
                        </label>

                        <Select
                            options={semesterOptions}
                            placeholder="Select semester"
                            value={semesterOptions.find(option => option.value === semester)}
                            onChange={selected => setSemester(selected?.value || "")}
                            maxMenuHeight={180}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col gap-5 border-t border-gray-200 pt-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0 flex-1">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                        />
                    </div>

                    <div className="flex w-full justify-end lg:w-auto">
                        <button
                            onClick={handleSubmit}
                            className="w-full rounded-xl px-6 py-3 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto sm:min-w-55 cursor-pointer"
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font,
                            }}
                        >
                            Generate Analysis
                        </button>
                    </div>

                </div>

            </div>
        </div>

        // <div
        //     className="h-full rounded-2xl border border-gray-200 p-5"
        //     style={{ backgroundColor: COLORS.latte }}
        // >
        //     {/* Header */}
        //     <div className="mb-5">
        //         <h2
        //             className="text-xl font-semibold"
        //             style={{ color: COLORS.mintDark }}
        //         >
        //             Subject Analysis
        //         </h2>

        //         <p className="mt-1 text-sm text-gray-600">
        //             Select the academic year, course, and semester to generate the subject-wise analysis.
        //         </p>
        //     </div>

        //     {/* Form Card */}
        //     <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        //         <div className="grid gap-4 md:grid-cols-3">

        //             {/* Academic Year */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Academic Year
        //                 </label>

        //                 <Select
        //                     options={yearOptions}
        //                     placeholder="Select year"
        //                     value={yearList.find(option => option.value === academicYear)}
        //                     onChange={selected => setAcademicYear(selected?.value || "")}
        //                     maxMenuHeight={180}
        //                 />
        //             </div>

        //             {/* Course */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Course
        //                 </label>

        //                 <Select
        //                     options={courseOptions}
        //                     placeholder="Select course"
        //                     value={courseOptions.find(option => option.value === course)}
        //                     onChange={selected => setCourse(selected?.value || "")}
        //                     maxMenuHeight={180}
        //                 />
        //             </div>

        //             {/* Semester */}
        //             <div>
        //                 <label
        //                     className="mb-2 block text-sm font-semibold"
        //                     style={{ color: COLORS.mintDark }}
        //                 >
        //                     Semester
        //                 </label>

        //                 <Select
        //                     options={semesterOptions}
        //                     placeholder="Select semester"
        //                     value={semesterOptions.find(option => option.value === semester)}
        //                     onChange={selected => setSemester(selected?.value || "")}
        //                     maxMenuHeight={180}
        //                 />
        //             </div>

        //         </div>

        //         {/* Footer */}
        //         <div className="mt-6 flex items-center justify-between">

        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //             />

        //             <button
        //                 onClick={handleSubmit}
        //                 className="rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font,
        //                 }}
        //             >
        //                 Generate Analysis
        //             </button>

        //         </div>

        //     </div>
        // </div>

        // <div className='h-full flex flex-col p-4'>
        //     <div
        //         className='text-xl font-semibold pb-4'
        //         style={{ color: COLORS.mint }}
        //     >
        //         Subject Analysis
        //     </div>
        //     <div className='w-full flex gap-4'>
        //         <div className='flex-1'>
        //             <Select
        //                 options={yearOptions}
        //                 placeholder='Select a year'
        //                 value={yearList.find(option => (
        //                     option.value === academicYear
        //                 ))}
        //                 onChange={selected => setAcademicYear(selected?.value || '')}
        //                 maxMenuHeight={300}
        //             />
        //         </div>
        //         <div className='flex-1'>
        //             <Select
        //                 options={courseOptions}
        //                 placeholder='Select a course'
        //                 value={courseOptions.find(option => (
        //                     option.value === course
        //                 ))}
        //                 onChange={selected => setCourse(selected?.value || '')}
        //                 maxMenuHeight={300}
        //             />
        //         </div>

        //         <div className="flex-1">
        //             <Select
        //                 options={semesterOptions}
        //                 placeholder='Select a semester'
        //                 value={semesterOptions.find((option) => (
        //                     option.value === semester
        //                 ))}
        //                 onChange={selected => setSemester(selected?.value || "")}
        //                 maxMenuHeight={300}
        //             />
        //         </div>
        //     </div>

        //     <div className='flex gap-5 my-7'>
        //         <div className='flex w-4/5 items-center'>
        //             <button
        //                 className='w-1/3 rounded-sm p-1 cursor-pointer duration-200'
        //                 onMouseEnter={() => setIsHovered(true)}
        //                 onMouseLeave={() => setIsHovered(false)}
        //                 style={{
        //                     backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //                 onClick={handleSubmit}
        //             >
        //                 Submit
        //             </button>
        //             {/* {uploading && <Loading type='upload' />} */}
        //         </div>
        //     </div>
        //     <ErrorSuccessMsg
        //         errorMsg={errorMsg}
        //         successMsg={successMsg}
        //         setSuccessMsg={setSuccessMsg}
        //     />
        // </div>
    ) : (
        <BarGraph
            data={graphData}
            setIsOpen={setIsOpen}
        />
    )
}

export default SubjectAnalysis