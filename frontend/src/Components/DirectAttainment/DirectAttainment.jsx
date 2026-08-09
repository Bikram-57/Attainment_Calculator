import React, { useEffect, useState } from 'react'
import axios from 'axios';
import DirectAttainmentHeader from './DirectAttainmentHeader';
import { MdRemoveRedEye } from "react-icons/md";
import { Loading } from '../index';
import DirectAttainmentTable from './DirectAttainmentTable';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { COLORS } from '../../constants/theme';

function DirectAttainment() {
    const [allData, setAllData] = useState([]);
    const [data, setData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [toggleDirectAttain, setToggleDirectAttain] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingView, setLoadingView] = useState(false);

    useDocumentTitle('Direct Attainment - Menu');

    const toggleUpdate = () => {
        setToggleDirectAttain(prev => !prev)
    }

    const getAllData = async () => {
        try {
            const res = await axios.get('/dir/report');
            setAllData(res.data.data);
        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.log("Error || DirectAttainment || getAllData() || ", err);
        } finally {
            setLoading(false);
        }
    }

    // const filteredAllData = allData.filter(directAttain =>
    //     directAttain.course.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    //     String(directAttain.academicYear).toLowerCase().includes(searchQuery.toLowerCase().trim())
    // );

    const filteredAllData = allData.filter(directAttain => {
        const searchText = `${directAttain.course} ${directAttain.academicYear}`
            .toLowerCase();

        return searchText.includes(searchQuery.toLowerCase().trim());
    });

    const handleView = async (course, academicYear) => {
        setLoadingView(true);
        try {
            const res = await axios.get('/dir/', {
                params: {
                    course,
                    academicYear
                }
            });
            setData(res.data.data);
            setIsOpen(true);
        } catch (err) {
            console.log('Error: ', err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
            console.log("Error || DirectAttainment || handleView() || ", err);
        } finally {
            setLoadingView(false);
        }
    }


    useEffect(() => {
        getAllData();
    }, [toggleDirectAttain]);

    return !loading ? (
        !isOpen ? (
            <div className="flex h-full w-full flex-col overflow-hidden">
                <DirectAttainmentHeader
                    toggleUpdate={toggleUpdate}
                    setSearchQuery={setSearchQuery}
                />

                <div className="flex-1 p-3 sm:p-4 lg:p-5">

                    <div className="h-full max-h-[calc(100vh-220px)] overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">

                        {filteredAllData?.length > 0 ? (

                            <table className="min-w-162.5 w-full text-sm">

                                <thead className="sticky top-0 z-2">
                                    <tr
                                        style={{
                                            backgroundColor: COLORS.mint,
                                            color: COLORS.font,
                                        }}
                                    >
                                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold sm:px-6">
                                            Course
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold sm:px-6">
                                            Academic Year
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold sm:px-6">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAllData.map((directAttain, index) => (
                                        <tr
                                            key={directAttain.id}
                                            className={`border-b border-gray-200 transition-colors hover:bg-gray-100 ${index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                                }`}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800 sm:px-6">
                                                {directAttain.course}
                                            </td>

                                            <td className="px-4 py-3 text-center sm:px-6">
                                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                    {directAttain.academicYear}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 sm:px-6">
                                                <div className="flex justify-center">
                                                    {!loadingView ? (
                                                        <button
                                                            onClick={() =>
                                                                handleView(
                                                                    directAttain.course,
                                                                    directAttain.academicYear
                                                                )
                                                            }
                                                            className="rounded-lg p-2 transition hover:opacity-90 cursor-pointer"
                                                            style={{
                                                                backgroundColor: COLORS.mint,
                                                                color: COLORS.font,
                                                            }}
                                                            title="View Report"
                                                        >
                                                            <MdRemoveRedEye size={16} />
                                                        </button>
                                                    ) : (
                                                        <Loading type="view" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        ) : (

                            <div className="flex min-h-87.5 flex-col items-center justify-center px-6 text-center">

                                <div className="mb-4 text-5xl">📄</div>

                                <h3
                                    className="text-lg font-semibold sm:text-xl"
                                    style={{ color: COLORS.mintDark }}
                                >
                                    No Reports Available
                                </h3>

                                <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
                                    Generated direct attainment reports will appear here.
                                </p>

                            </div>

                        )}

                    </div>

                </div>


                {/* <div className="h-full flex flex-col">
                <DirectAttainmentHeader
                    toggleUpdate={toggleUpdate}
                    setSearchQuery={setSearchQuery}
                />
                <div className="m-3 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    {filteredAllData?.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: COLORS.mint,
                                        color: COLORS.font,
                                    }}
                                >
                                    <th className="px-6 py-3 text-left font-semibold">
                                        Course
                                    </th>

                                    <th className="px-6 py-3 text-center font-semibold">
                                        Academic Year
                                    </th>

                                    <th className="px-6 py-3 text-center font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAllData.map((directAttain, index) => (
                                    <tr
                                        key={directAttain.id}
                                        className={`border-b border-gray-200 transition hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-6 py-3 font-medium text-gray-800">
                                            {directAttain.course}
                                        </td>

                                        <td className="px-6 py-3 text-center">
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {directAttain.academicYear}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <div className="flex justify-center">
                                                {!loadingView ? (
                                                    <button
                                                        onClick={() =>
                                                            handleView(
                                                                directAttain.course,
                                                                directAttain.academicYear
                                                            )
                                                        }
                                                        className="rounded-md p-1.5 transition hover:opacity-90 cursor-pointer"
                                                        style={{
                                                            backgroundColor: COLORS.mint,
                                                            color: COLORS.font,
                                                        }}
                                                        title="View Report"
                                                    >
                                                        <MdRemoveRedEye size={15} />
                                                    </button>
                                                ) : (
                                                    <Loading type="view" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex h-72 flex-col items-center justify-center">
                            <div className="mb-3 text-5xl">📄</div>

                            <h3
                                className="text-lg font-semibold"
                                style={{ color: COLORS.mintDark }}
                            >
                                No Reports Available
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Generated direct attainment reports will appear here.
                            </p>
                        </div>
                    )}
                </div> */}

                {/* <div className="flex-1 overflow-y-auto">
                    {filteredAllData?.length > 0 ?
                        (<table className='w-full'>
                            <thead>
                                <tr className='text-center border-b border-gray-300'>
                                    <th className='px-5 py-2 w- [10%]'>Course</th>
                                    <th className='px-5 py-2 w- [15%]'>Academic Year</th>
                                    <th className='px-5 py-2 w- [10%]'>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAllData?.map(directAttain => (
                                    <tr className='text-center border-b border-gray-300' key={directAttain.id}>
                                        <td className='px-5 py-2 w- [10%]'>{directAttain.course}</td>
                                        <td className='px-5 py-2 w- [15%]'>{directAttain.academicYear}</td>
                                        <td className='px-5 py-2 flex items-center justify-center'>
                                            {!loadingView ? (
                                                <MdRemoveRedEye
                                                    className='h-5 w-5 cursor-pointer'
                                                    onClick={() => handleView(directAttain.course, directAttain.academicYear)}
                                                />
                                            ) : <Loading type='view' />
                                            }
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
        ) : (
            <DirectAttainmentTable
                data={data}
                setIsOpen={setIsOpen}
            />
        )
    ) : <Loading />
}

export default DirectAttainment







// import React, { useState } from 'react'
// import axios from 'axios'
// import { COLORS } from '../../constants/theme';
// import ErrorSuccessMsg from '../ErrorSuccessMsg';
// import Loading from '../Loading';
// import DirectAttainmentTable from './DirectAttainmentTable';

// function DirectAttainment() {
//     const [data, setData] = useState([]);
//     const [academicYear, setAcademicYear] = useState('')
//     const [course, setCourse] = useState('')
//     const [errorMsg, setErrorMsg] = useState('');
//     const [isHovered, setIsHovered] = useState(false);
//     const [isOpen, setIsOpen] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const currentYear = new Date().getFullYear();
//     const yearList = [2024];
//     for (let year = yearList[0] + 1; year <= currentYear; year++) {
//         yearList.push(year);
//     }

//     const handleSubmit = async () => {
//         if (!academicYear || !course) {
//             setErrorMsg("Please fill all the fields");
//             return;
//         }
//         setLoading(true);
//         setErrorMsg('');
//         try {
//             const res = await axios.get('/dir/', {
//                 params: {
//                     course,
//                     academicYear
//                 }
//             });
//             setData(res.data.data);
//             setIsOpen(true);
//             setAcademicYear('');
//             setCourse('');
//         } catch (err) {
//             setErrorMsg("Something went wrong! Format error!");
//             console.log("Error on handleSubmit || ", err);
//         } finally {
//             setLoading(false);
//         }
//     }

//     return !isOpen ? (
//         <div className='h-full flex flex-col p-4'>
//             <div className='flex justify-between pb-4'>
//                 <div
//                     className='text-xl font-semibold'
//                     style={{ color: COLORS.mint }}
//                 >
//                     Direct Attainment
//                 </div>
//             </div>
//             <div className='w-full flex gap-4'>
//                 <select
//                     className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
//                     style={{ backgroundColor: COLORS.font }}
//                     value={academicYear}
//                     onChange={(e) => setAcademicYear(e.target.value)}
//                 >
//                     <option value=''>Select a year</option>
//                     {yearList.map(year => (
//                         <option key={year} value={year}>
//                             {year}
//                         </option>
//                     ))}
//                 </select>
//                 <select
//                     className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
//                     style={{ backgroundColor: COLORS.font }}
//                     value={course}
//                     onChange={(e) => setCourse(e.target.value)}
//                 >
//                     <option value=''>Select a course</option>
//                     <option value='BCA'>BCA</option>
//                     <option value='MCA'>MCA</option>
//                 </select>
//             </div>

//             <div className='flex gap-5 my-7'>
//                 <div className='flex w-4/5 items-center'>
//                     <button
//                         className='w-1/3 rounded-sm p-1 cursor-pointer duration-200'
//                         onMouseEnter={() => setIsHovered(true)}
//                         onMouseLeave={() => setIsHovered(false)}
//                         style={{
//                             backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
//                             color: COLORS.font
//                         }}
//                         onClick={handleSubmit}
//                     >
//                         Submit
//                     </button>
//                     {loading && <Loading type='submit' />}
//                 </div>
//             </div>
//             <ErrorSuccessMsg
//                 errorMsg={errorMsg}
//             />
//         </div>
//     ) : (
//         <DirectAttainmentTable
//             data={data}
//             setIsOpen={setIsOpen}
//         />
//     )
// }

// export default DirectAttainment