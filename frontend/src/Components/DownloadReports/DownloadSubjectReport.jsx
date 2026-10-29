// import React, { useState, useEffect } from 'react'
// import { COLORS } from '../../constants/theme'
// import axios from 'axios';
// import { ErrorSuccessMsg } from '../index';
// import { Loading } from '../index';
// import Select from 'react-select';
// import { useSelector } from 'react-redux';
// import useDocumentTitle from '../../hooks/useDocumentTitle';
// import useFileDownload from '../../hooks/useFileDownload';

// function DownloadSubjectReport() {
// 	const userData = useSelector(state => state.auth.userData);

// 	const [academicYear, setAcademicYear] = useState('')
// 	const [course, setCourse] = useState('')
// 	const [subjectId, setSubjectId] = useState('')
// 	const [isDisabled, setIsDisabled] = useState(true);
// 	const [subjectList, setSubjectList] = useState([]);
// 	const [isHovered, setIsHovered] = useState(false);
// 	const [errorMsg, setErrorMsg] = useState('');
// 	const [downloading, setDownloading] = useState(false);

// 	const currentYear = new Date().getFullYear();
// 	const yearList = [2024];

// 	useDocumentTitle('Subject Report - Download')

// 	for (let year = yearList[0] + 1; year <= currentYear; year++) {
// 		yearList.push(year);
// 	}

// 	const yearOptions = yearList.map(year => (
// 		{
// 			value: year,
// 			label: year
// 		}
// 	));

// 	const courseOptions = [
// 		{ value: 'BCA', label: 'BCA' },
// 		{ value: 'MCA', label: 'MCA' }
// 	];

// 	const subjectOptions = subjectList.map(sub => (
// 		{
// 			value: sub.subjectId,
// 			label: `${sub.subjectId} - ${sub.subjectName}`
// 		}
// 	));

// 	const handleYear = (selectedYear) => {
// 		setAcademicYear(selectedYear);
// 		setSubjectId('');
// 	}

// 	const handleCourse = (selectedCourse) => {
// 		setCourse(selectedCourse);
// 		setSubjectId('');
// 	}

// 	const handleDownload = async () => {
// 		if (academicYear.length === 0 || course.length === 0 || subjectId.length === 0) {
// 			setErrorMsg('Please fill all the fields!');
// 			return;
// 		}
// 		setErrorMsg('');
// 		try {
// 			setDownloading(true);
// 			const response = await axios.get('/file/download', {
// 				params: {
// 					subjectId,
// 					course,
// 					academicYear,
// 				},
// 				responseType: 'blob',
// 			});

// 			useFileDownload(
// 				response.data,
// 				`Subject_Report_${subjectId}_${academicYear}.xlsx`
// 			)

// 			// const blob = new Blob([response.data]);
// 			// const url = window.URL.createObjectURL(blob);

// 			// const link = document.createElement('a');
// 			// link.href = url;

// 			// link.download = `Subject_Report_${subjectId}_${academicYear}.xlsx`;

// 			// document.body.appendChild(link);
// 			// link.click();

// 			// link.remove();
// 			// window.URL.revokeObjectURL(url);
// 		} catch (error) {
// 			if (error.response?.status === 404) {
// 				setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Data not available!');
// 			} else {
// 				console.error('Download failed:', error);
// 				setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download report.');
// 			}
// 		} finally {
// 			setDownloading(false);
// 		}
// 	};

// 	useEffect(() => {
// 		if (!course || !academicYear) {
// 			setSubjectList([]);
// 			setIsDisabled(true);
// 			return;
// 		}
// 		const fetchSubjects = async () => {
// 			try {
// 				let res;
// 				if (userData.role === 'admin') {
// 					res = await axios.get(`/sub/year/${academicYear}/course/${course}`);
// 				} else {
// 					res = await axios.get('/assignSub/sub', {
// 						params: {
// 							year: academicYear,
// 							course
// 						}
// 					});
// 				}
// 				if (res.data.data.length === 0) {
// 					setErrorMsg('No data for the selected year and course!');
// 					setSubjectList([]);
// 					setIsDisabled(true);
// 					return;
// 				}
// 				setSubjectList(res.data.data);
// 				setIsDisabled(false);
// 				setErrorMsg('');
// 			} catch (err) {
// 				setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to fetch subjects!');
// 				console.log('Error fetching subjects || ', err);
// 				setSubjectList([]);
// 				setIsDisabled(true);
// 			}
// 		};
// 		fetchSubjects();
// 	}, [academicYear, course]);

// 	return (
// 		<div
// 			className="h-full w-full rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6"
// 			style={{ backgroundColor: COLORS.latte }}
// 		>
// 			{/* Header */}
// 			<div className="mb-6">
// 				<h2
// 					className="text-xl font-semibold sm:text-2xl"
// 					style={{ color: COLORS.mintDark }}
// 				>
// 					Download Subject Report
// 				</h2>

// 				<p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
// 					Select the academic year, course, and subject to generate the
// 					detailed subject report.
// 				</p>
// 			</div>

// 			{/* Form Card */}
// 			<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">

// 				<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

// 					{/* Academic Year */}
// 					<div>
// 						<label
// 							className="mb-2 block text-sm font-semibold"
// 							style={{ color: COLORS.mintDark }}
// 						>
// 							Academic Year
// 						</label>

// 						<Select
// 							options={yearOptions}
// 							placeholder="Select year"
// 							value={
// 								yearOptions.find(
// 									(option) => option.value === academicYear
// 								) || null
// 							}
// 							onChange={(selected) =>
// 								handleYear(selected?.value || "")
// 							}
// 							maxMenuHeight={180}
// 						/>
// 					</div>

// 					{/* Course */}
// 					<div>
// 						<label
// 							className="mb-2 block text-sm font-semibold"
// 							style={{ color: COLORS.mintDark }}
// 						>
// 							Course
// 						</label>

// 						<Select
// 							options={courseOptions}
// 							placeholder="Select course"
// 							value={
// 								courseOptions.find(
// 									(option) => option.value === course
// 								) || null
// 							}
// 							onChange={(selected) =>
// 								handleCourse(selected?.value || "")
// 							}
// 							maxMenuHeight={180}
// 						/>
// 					</div>

// 					{/* Subject */}
// 					<div>
// 						<label
// 							className="mb-2 block text-sm font-semibold"
// 							style={{ color: COLORS.mintDark }}
// 						>
// 							Subject
// 						</label>

// 						<Select
// 							options={subjectOptions}
// 							placeholder="Select subject"
// 							value={
// 								subjectOptions.find(
// 									(option) => option.value === subjectId
// 								) || null
// 							}
// 							onChange={(selected) =>
// 								setSubjectId(selected?.value || "")
// 							}
// 							isDisabled={isDisabled}
// 							maxMenuHeight={180}
// 						/>
// 					</div>

// 				</div>

// 				{/* Footer */}
// 				<div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 lg:flex-row lg:items-center lg:justify-between">

// 					<div className="min-w-0 flex-1">
// 						<ErrorSuccessMsg
// 							errorMsg={errorMsg}
// 						/>
// 					</div>

// 					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

// 						{downloading && <Loading type="download" />}

// 						<button
// 							onClick={handleDownload}
// 							className="w-full rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
// 							style={{
// 								backgroundColor: COLORS.mint,
// 								color: COLORS.font,
// 							}}
// 						>
// 							Download Report
// 						</button>

// 					</div>

// 				</div>

// 			</div>

// 		</div>

// 		// <div
// 		// 	className="h-full rounded-2xl border border-gray-200 p-5"
// 		// 	style={{ backgroundColor: COLORS.latte }}
// 		// >
// 		// 	{/* Header */}
// 		// 	<div className="mb-5">
// 		// 		<h2
// 		// 			className="text-xl font-semibold"
// 		// 			style={{ color: COLORS.mintDark }}
// 		// 		>
// 		// 			Download Subject Report
// 		// 		</h2>

// 		// 		<p className="mt-1 text-sm text-gray-600">
// 		// 			Select the academic year, course, and subject to generate the detailed subject report.
// 		// 		</p>
// 		// 	</div>

// 		// 	{/* Form Card */}
// 		// 	<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

// 		// 		<div className="grid gap-4 md:grid-cols-3">

// 		// 			{/* Academic Year */}
// 		// 			<div>
// 		// 				<label
// 		// 					className="mb-2 block text-sm font-semibold"
// 		// 					style={{ color: COLORS.mintDark }}
// 		// 				>
// 		// 					Academic Year
// 		// 				</label>

// 		// 				<Select
// 		// 					options={yearOptions}
// 		// 					placeholder="Select year"
// 		// 					value={yearOptions.find(option => option.value === academicYear) || null}
// 		// 					onChange={selected => handleYear(selected?.value || "")}
// 		// 					maxMenuHeight={180}
// 		// 				/>
// 		// 			</div>

// 		// 			{/* Course */}
// 		// 			<div>
// 		// 				<label
// 		// 					className="mb-2 block text-sm font-semibold"
// 		// 					style={{ color: COLORS.mintDark }}
// 		// 				>
// 		// 					Course
// 		// 				</label>

// 		// 				<Select
// 		// 					options={courseOptions}
// 		// 					placeholder="Select course"
// 		// 					value={courseOptions.find(option => option.value === course) || null}
// 		// 					onChange={selected => handleCourse(selected?.value || "")}
// 		// 					maxMenuHeight={180}
// 		// 				/>
// 		// 			</div>

// 		// 			{/* Subject */}
// 		// 			<div>
// 		// 				<label
// 		// 					className="mb-2 block text-sm font-semibold"
// 		// 					style={{ color: COLORS.mintDark }}
// 		// 				>
// 		// 					Subject
// 		// 				</label>

// 		// 				<Select
// 		// 					options={subjectOptions}
// 		// 					placeholder="Select subject"
// 		// 					value={subjectOptions.find(option => option.value === subjectId) || null}
// 		// 					onChange={selected => setSubjectId(selected?.value || "")}
// 		// 					isDisabled={isDisabled}
// 		// 					maxMenuHeight={180}
// 		// 				/>
// 		// 			</div>

// 		// 		</div>

// 		// 		{/* Footer */}
// 		// 		<div className="mt-6 flex items-center justify-between">

// 		// 			<ErrorSuccessMsg
// 		// 				errorMsg={errorMsg}
// 		// 			/>

// 		// 			<div className="flex items-center gap-4">

// 		// 				{downloading && <Loading type="download" />}

// 		// 				<button
// 		// 					onClick={handleDownload}
// 		// 					className="rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
// 		// 					style={{
// 		// 						backgroundColor: COLORS.mint,
// 		// 						color: COLORS.font,
// 		// 					}}
// 		// 				>
// 		// 					Download Report
// 		// 				</button>

// 		// 			</div>

// 		// 		</div>

// 		// 	</div>
// 		// </div>

// 		// <div className='h-full flex flex-col p-4'>
// 		// 	<div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
// 		// 		<div
// 		// 			className="text-xl font-semibold"
// 		// 			style={{ color: COLORS.mint }}
// 		// 		>
// 		// 			Download Subject Report
// 		// 		</div>
// 		// 	</div>
// 		// 	<div className='w-full flex gap-4'>
// 		// 		<div className='flex-1'>
// 		// 			<Select
// 		// 				options={yearOptions}
// 		// 				placeholder='Select a year'
// 		// 				value={yearOptions.find(option => (
// 		// 					option.value === academicYear
// 		// 				)) || null}
// 		// 				onChange={selected => handleYear(selected?.value || '')}
// 		// 				maxMenuHeight={300}
// 		// 			/>
// 		// 		</div>
// 		// 		<div className='flex-1'>
// 		// 			<Select
// 		// 				options={courseOptions}
// 		// 				placeholder='Select a course'
// 		// 				value={courseOptions.find(option => (
// 		// 					option.value === course
// 		// 				)) || null}
// 		// 				onChange={selected => handleCourse(selected?.value || '')}
// 		// 				maxMenuHeight={300}
// 		// 			/>
// 		// 		</div>
// 		// 		<div className='flex-1'>
// 		// 			<Select
// 		// 				options={subjectOptions}
// 		// 				placeholder='Select a subject'
// 		// 				value={subjectOptions.find(option => (
// 		// 					option.value === subjectId
// 		// 				)) || null}
// 		// 				onChange={selected => setSubjectId(selected?.value || '')}
// 		// 				isDisabled={isDisabled}
// 		// 				maxMenuHeight={300}
// 		// 			/>
// 		// 		</div>
// 		// 	</div>

// 		// 	<div className='flex gap-5 my-7'>
// 		// 		<div className='flex w-full h-4 items-center'>
// 		// 			<button
// 		// 				onMouseEnter={() => setIsHovered(true)}
// 		// 				onMouseLeave={() => setIsHovered(false)}
// 		// 				className='w-1/5 rounded-sm p-1 cursor-pointer duration-200'
// 		// 				style={{
// 		// 					backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
// 		// 					color: COLORS.font
// 		// 				}}
// 		// 				onClick={handleDownload}
// 		// 			>
// 		// 				Download
// 		// 			</button>
// 		// 			{downloading && <Loading type='download' />}
// 		// 		</div>
// 		// 	</div>
// 		// 	<ErrorSuccessMsg
// 		// 		errorMsg={errorMsg}
// 		// 	/>
// 		// </div>
// 	)
// }

// export default DownloadSubjectReport




//new
// import React, { useState, useEffect, useRef } from 'react'
// import { COLORS } from '../../constants/theme'
// import axios from 'axios';
// import { ErrorSuccessMsg } from '../index';
// import { Loading } from '../index';
// import Select from 'react-select';
// import { useSelector } from 'react-redux';
// import useDocumentTitle from '../../hooks/useDocumentTitle';
// import useFileDownload from '../../hooks/useFileDownload';
// import { FaFileExcel, FaFilePdf } from "react-icons/fa";
// import { IoChevronDown } from "react-icons/io5";

// function DownloadSubjectReport() {
//     const userData = useSelector(state => state.auth.userData);

//     const [academicYear, setAcademicYear] = useState('')
//     const [course, setCourse] = useState('')
//     const [subjectId, setSubjectId] = useState('')
//     const [isDisabled, setIsDisabled] = useState(true);
//     const [subjectList, setSubjectList] = useState([]);
//     const [errorMsg, setErrorMsg] = useState('');
//     const [downloading, setDownloading] = useState(false);

//     // Dropdown state and ref
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const dropdownRef = useRef(null);

//     const currentYear = new Date().getFullYear();
//     const yearList = [2024];

//     useDocumentTitle('Subject Report - Download')

//     for (let year = yearList[0] + 1; year <= currentYear; year++) {
//         yearList.push(year);
//     }

//     const yearOptions = yearList.map(year => (
//         {
//             value: year,
//             label: year
//         }
//     ));

//     const courseOptions = [
//         { value: 'BCA', label: 'BCA' },
//         { value: 'MCA', label: 'MCA' }
//     ];

//     const subjectOptions = subjectList.map(sub => (
//         {
//             value: sub.subjectId,
//             label: `${sub.subjectId} - ${sub.subjectName}`
//         }
//     ));

//     // Handle clicks outside the dropdown to close it automatically
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsDropdownOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const handleYear = (selectedYear) => {
//         setAcademicYear(selectedYear);
//         setSubjectId('');
//     }

//     const handleCourse = (selectedCourse) => {
//         setCourse(selectedCourse);
//         setSubjectId('');
//     }

//     const handleDownload = async (type) => {
//         setIsDropdownOpen(false); // Close dropdown immediately upon selection
//         if (academicYear.length === 0 || course.length === 0 || subjectId.length === 0) {
//             setErrorMsg('Please fill all the fields!');
//             return;
//         }
//         setErrorMsg('');
//         try {
//             setDownloading(true);

//             // TODO: Update the PDF route here to match your actual backend endpoint 
//             const apiUrl = type === 'excel' ? '/file/download' : '/file/download-pdf';

//             const response = await axios.get(apiUrl, {
//                 params: {
//                     subjectId,
//                     course,
//                     academicYear,
//                 },
//                 responseType: 'blob',
//             });

//             useFileDownload(
//                 response.data,
//                 `Subject_Report_${subjectId}_${academicYear}.${type === 'excel' ? 'xlsx' : 'pdf'}`
//             )

//         } catch (error) {
//             if (error.response?.status === 404) {
//                 setErrorMsg(error?.response?.data?.message || error?.response?.data?.error || 'Data not available!');
//             } else {
//                 console.error('Download failed:', error);
//                 setErrorMsg(error?.response?.data?.message || error?.response?.data?.error || 'Failed to download report.');
//             }
//         } finally {
//             setDownloading(false);
//         }
//     };

//     useEffect(() => {
//         if (!course || !academicYear) {
//             setSubjectList([]);
//             setIsDisabled(true);
//             return;
//         }
//         const fetchSubjects = async () => {
//             try {
//                 let res;
//                 if (userData.role === 'admin') {
//                     res = await axios.get(`/sub/year/${academicYear}/course/${course}`);
//                 } else {
//                     res = await axios.get('/assignSub/sub', {
//                         params: {
//                             year: academicYear,
//                             course
//                         }
//                     });
//                 }
//                 if (res.data.data.length === 0) {
//                     setErrorMsg('No data for the selected year and course!');
//                     setSubjectList([]);
//                     setIsDisabled(true);
//                     return;
//                 }
//                 setSubjectList(res.data.data);
//                 setIsDisabled(false);
//                 setErrorMsg('');
//             } catch (err) {
//                 setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to fetch subjects!');
//                 console.log('Error fetching subjects || ', err);
//                 setSubjectList([]);
//                 setIsDisabled(true);
//             }
//         };
//         fetchSubjects();
//     }, [academicYear, course]);

//     return (
//         <div
//             className="h-full w-full rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6"
//             style={{ backgroundColor: COLORS.latte }}
//         >
//             {/* Header */}
//             <div className="mb-6">
//                 <h2
//                     className="text-xl font-semibold sm:text-2xl"
//                     style={{ color: '#701538' }} // Matching theme color from screenshot
//                 >
//                     Download Subject Report
//                 </h2>

//                 <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
//                     Select the academic year, course, and subject to generate the
//                     detailed subject report.
//                 </p>
//             </div>

//             {/* Form Card */}
//             <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">

//                 <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

//                     {/* Academic Year */}
//                     <div>
//                         <label
//                             className="mb-2 block text-sm font-semibold"
//                             style={{ color: '#701538' }}
//                         >
//                             Academic Year
//                         </label>

//                         <Select
//                             options={yearOptions}
//                             placeholder="Select year"
//                             value={
//                                 yearOptions.find(
//                                     (option) => option.value === academicYear
//                                 ) || null
//                             }
//                             onChange={(selected) =>
//                                 handleYear(selected?.value || "")
//                             }
//                             maxMenuHeight={180}
//                         />
//                     </div>

//                     {/* Course */}
//                     <div>
//                         <label
//                             className="mb-2 block text-sm font-semibold"
//                             style={{ color: '#701538' }}
//                         >
//                             Course
//                         </label>

//                         <Select
//                             options={courseOptions}
//                             placeholder="Select course"
//                             value={
//                                 courseOptions.find(
//                                     (option) => option.value === course
//                                 ) || null
//                             }
//                             onChange={(selected) =>
//                                 handleCourse(selected?.value || "")
//                             }
//                             maxMenuHeight={180}
//                         />
//                     </div>

//                     {/* Subject */}
//                     <div>
//                         <label
//                             className="mb-2 block text-sm font-semibold"
//                             style={{ color: '#701538' }}
//                         >
//                             Subject
//                         </label>

//                         <Select
//                             options={subjectOptions}
//                             placeholder="Select subject"
//                             value={
//                                 subjectOptions.find(
//                                     (option) => option.value === subjectId
//                                 ) || null
//                             }
//                             onChange={(selected) =>
//                                 setSubjectId(selected?.value || "")
//                             }
//                             isDisabled={isDisabled}
//                             maxMenuHeight={180}
//                         />
//                     </div>

//                 </div>

//                 {/* Footer */}
//                 <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 lg:flex-row lg:items-center lg:justify-between">

//                     <div className="min-w-0 flex-1">
//                         <ErrorSuccessMsg
//                             errorMsg={errorMsg}
//                         />
//                     </div>

//                     <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

//                         {downloading && <Loading type="download" />}

//                         <div className="relative z-40" ref={dropdownRef}>
//                             <button
//                                 onClick={() => setIsDropdownOpen((prev) => !prev)}
//                                 className="flex w-full items-center justify-center gap-2 rounded-md bg-[#701538] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#8a1945] cursor-pointer sm:w-auto"
//                             >
//                                 <span>Download Report</span>
//                                 <IoChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                             </button>

//                             {isDropdownOpen && (
//                                 <div className="absolute right-0 bottom-full mb-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50 sm:bottom-auto sm:top-full sm:mt-2">
//                                     <button
//                                         onClick={() => handleDownload('excel')}
//                                         className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
//                                     >
//                                         <FaFileExcel className="text-green-600 text-lg" />
//                                         <span>Download Excel</span>
//                                     </button>
//                                     <button
//                                         onClick={() => handleDownload('pdf')}
//                                         className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
//                                     >
//                                         <FaFilePdf className="text-red-600 text-lg" />
//                                         <span>Download PDF</span>
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                     </div>

//                 </div>

//             </div>

//         </div>
//     )
// }

// export default DownloadSubjectReport








import React, { useState, useEffect, useRef } from 'react'
import { COLORS } from '../../constants/theme'
import axios from 'axios';
import { ErrorSuccessMsg } from '../index';
import { Loading } from '../index';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useFileDownload from '../../hooks/useFileDownload';
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

function DownloadSubjectReport() {
    const userData = useSelector(state => state.auth.userData);

    const [academicYear, setAcademicYear] = useState('')
    const [course, setCourse] = useState('')
    const [subjectId, setSubjectId] = useState('')
    const [isDisabled, setIsDisabled] = useState(true);
    const [subjectList, setSubjectList] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [downloading, setDownloading] = useState(false);

    // Dropdown state and ref
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentYear = new Date().getFullYear();
    const yearList = [2024];

    useDocumentTitle('Subject Report - Download')

    for (let year = yearList[0] + 1; year <= currentYear; year++) {
        yearList.push(year);
    }

    const yearOptions = yearList.map(year => (
        {
            value: year,
            label: year
        }
    ));

    const courseOptions = [
        { value: 'BCA', label: 'BCA' },
        { value: 'MCA', label: 'MCA' }
    ];

    const subjectOptions = subjectList.map(sub => (
        {
            value: sub.subjectId,
            label: `${sub.subjectId} - ${sub.subjectName}`
        }
    ));

    // Handle clicks outside the dropdown to close it automatically
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleYear = (selectedYear) => {
        setAcademicYear(selectedYear);
        setSubjectId('');
    }

    const handleCourse = (selectedCourse) => {
        setCourse(selectedCourse);
        setSubjectId('');
    }

    const handleDownload = async (type) => {
        setIsDropdownOpen(false); // Close dropdown immediately upon selection
        if (academicYear.length === 0 || course.length === 0 || subjectId.length === 0) {
            setErrorMsg('Please fill all the fields!');
            return;
        }
        setErrorMsg('');
        try {
            setDownloading(true);

            // Updated to use the requested PDF endpoint
            const apiUrl = type === 'excel'
                ? '/file/download'
                : '/theory-print-ready/theory/download-master-report';

            const response = await axios.get(apiUrl, {
                params: {
                    subjectId,
                    course,
                    academicYear,
                },
                responseType: 'blob',
            });

            // useFileDownload(
            //     response.data,
            //     `Subject_Report_${subjectId}_${academicYear.replace(/\//g, '-')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
            // )

            useFileDownload(
                response.data,
                `Subject_Report_${subjectId}_${String(academicYear).replace(/\//g, '-')}.${type === 'excel' ? 'xlsx' : 'pdf'}`
            )

        } catch (error) {
            if (error.response?.status === 404) {
                setErrorMsg(error?.response?.data?.message || error?.response?.data?.error || 'Data not available!');
            } else {
                console.error('Download failed:', error);
                setErrorMsg(error?.response?.data?.message || error?.response?.data?.error || 'Failed to download report.');
            }
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        if (!course || !academicYear) {
            setSubjectList([]);
            setIsDisabled(true);
            return;
        }
        const fetchSubjects = async () => {
            try {
                let res;
                if (userData.role === 'admin') {
                    res = await axios.get(`/sub/year/${academicYear}/course/${course}`);
                } else {
                    res = await axios.get('/assignSub/sub', {
                        params: {
                            year: academicYear,
                            course
                        }
                    });
                }
                if (res.data.data.length === 0) {
                    setErrorMsg('No data for the selected year and course!');
                    setSubjectList([]);
                    setIsDisabled(true);
                    return;
                }
                setSubjectList(res.data.data);
                setIsDisabled(false);
                setErrorMsg('');
            } catch (err) {
                setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to fetch subjects!');
                console.log('Error fetching subjects || ', err);
                setSubjectList([]);
                setIsDisabled(true);
            }
        };
        fetchSubjects();
    }, [academicYear, course, userData.role]);

    return (
        <div
            className="h-full w-full rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6"
            style={{ backgroundColor: COLORS.latte }}
        >
            {/* Header */}
            <div className="mb-6">
                <h2
                    className="text-xl font-semibold sm:text-2xl"
                    style={{ color: '#701538' }}
                >
                    Download Subject Report
                </h2>

                <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
                    Select the academic year, course, and subject to generate the
                    detailed subject report.
                </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {/* Academic Year */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: '#701538' }}
                        >
                            Academic Year
                        </label>

                        <Select
                            options={yearOptions}
                            placeholder="Select year"
                            value={
                                yearOptions.find(
                                    (option) => option.value === academicYear
                                ) || null
                            }
                            onChange={(selected) =>
                                handleYear(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: '#701538' }}
                        >
                            Course
                        </label>

                        <Select
                            options={courseOptions}
                            placeholder="Select course"
                            value={
                                courseOptions.find(
                                    (option) => option.value === course
                                ) || null
                            }
                            onChange={(selected) =>
                                handleCourse(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: '#701538' }}
                        >
                            Subject
                        </label>

                        <Select
                            options={subjectOptions}
                            placeholder="Select subject"
                            value={
                                subjectOptions.find(
                                    (option) => option.value === subjectId
                                ) || null
                            }
                            onChange={(selected) =>
                                setSubjectId(selected?.value || "")
                            }
                            isDisabled={isDisabled}
                            maxMenuHeight={180}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0 flex-1">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

                        {downloading && <Loading type="download" />}

                        <div className="relative z-40 flex shadow-sm rounded-md" ref={dropdownRef}>
                            {/* Primary Action: Downloads Excel immediately */}
                            <button
                                onClick={() => handleDownload('excel')}
                                className="flex items-center gap-2 rounded-l-md bg-[#701538] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a1945] cursor-pointer"
                            >
                                <FaFileExcel className="text-white text-base" />
                                <span>Download Excel</span>
                            </button>

                            {/* Secondary Action: Opens dropdown for PDF */}
                            <button
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className="flex items-center rounded-r-md bg-[#701538] px-2.5 py-2.5 text-white transition hover:bg-[#8a1945] border-l border-white/20 cursor-pointer"
                            >
                                <IoChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu (Only shows PDF) */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50 sm:bottom-auto sm:top-full sm:mt-2">
                                    <button
                                        onClick={() => handleDownload('pdf')}
                                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                                    >
                                        <FaFilePdf className="text-red-600 text-lg" />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default DownloadSubjectReport