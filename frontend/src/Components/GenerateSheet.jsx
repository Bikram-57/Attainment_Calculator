import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { MdOutlineCancelPresentation } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { MdDone } from "react-icons/md";
import { COLORS } from '../constants/theme';
import { ErrorSuccessMsg } from './index';
import { Loading } from './index';
import Select from "react-select";
import { useSelector } from 'react-redux';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

function GenerateSheet() {
	const internalMarksFileInputRef = useRef(null);
	const externalMarksFileInputRef = useRef(null);
    
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [internalMarksFile, setInternalMarksFile] = useState(null);
	const [externalMarksFile, setExternalMarksFile] = useState(null);
	
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [generating, setGenerating] = useState(false);

    const [isDisabled, setIsDisabled] = useState(true);
	const [isHovered, setIsHovered] = useState(false);

	useDocumentTitle('Generate Sheet - Menu');

	const currentYear = new Date().getFullYear();
	const yearList = [2024];
	for (let year = yearList[0] + 1; year <= currentYear; year++) {
		yearList.push(year);
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

	const handleCourse = (selectedCourse) => {
		setCourse(selectedCourse);
	}

	const handleYear = (selectedYear) => {
		setAcademicYear(selectedYear);
	}

	const handleInternalMarksFileChange = (e) => {
		const selectedFile = e.target.files[0];

		const validTypes = [
			"application/vnd.ms-excel", // .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		];

		if (!selectedFile) return;
		if (!validTypes.includes(selectedFile.type)) {
			setErrorMsg('Only Excel files (.xls, .xlsx) are allowed');
			setInternalMarksFile(null);
			return;
		}

		setErrorMsg('');
		setInternalMarksFile(selectedFile);
	}

	const handleExternalMarksFileChange = (e) => {
		const selectedFile = e.target.files[0];

		const validTypes = [
			"application/vnd.ms-excel", // .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		];

		if (!selectedFile) return;
		if (!validTypes.includes(selectedFile.type)) {
			setErrorMsg('Only Excel files (.xls, .xlsx) are allowed');
			setExternalMarksFile(null);
			return;
		}

		setErrorMsg('');
		setExternalMarksFile(selectedFile);
	}

	const handleInternalMarksRemoveFile = () => {
		setInternalMarksFile(null);
		internalMarksFileInputRef.current.value = '';
	}

	const handleExternalMarksRemoveFile = () => {
		setInternalMarksFile(null);
		externalMarksFileInputRef.current.value = '';
	}

	const handleGenerate = async () => {
		if (!academicYear || !course) {
			setErrorMsg("Please fill all the fields");
			return;
		}

		if (!internalMarksFile || !externalMarksFile) {
			setErrorMsg("Please choose both the files!");
			return;
		}

		setGenerating(true);
        
		const formData = new FormData();
		formData.append('internalMarks', internalMarksFile);
		formData.append('externalMarks', externalMarksFile);
		formData.append('academicYear', academicYear);
		formData.append('course', course);

		setErrorMsg('');

		try {
			const res = await axios.post('/raw/upload-attainment-marks', formData);

			setSuccessMsg(res.data.message || 'Sheet generated successfully!');
			setInternalMarksFile(null);
			setExternalMarksFile(null);
			setAcademicYear('');
			setCourse('');
			setIsDisabled(true);
			
            console.log(res);
		} catch (err) {
			setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
			console.log("Error on handleGenerate || ", err);
		} finally {
			setGenerating(false);
			if (internalMarksFileInputRef.current) {
				internalMarksFileInputRef.current.value = '';
			}
			if (externalMarksFileInputRef.current) {
				externalMarksFileInputRef.current.value = '';
			}
		}
	}

	const handleDownloadFormat = async () => {
		// try {
		// 	const response = await axios.get('/download-format/',
		// 		{
		// 			responseType: 'blob',
		// 		}
		// 	);

		// 	const blob = new Blob([response.data]);
		// 	const url = window.URL.createObjectURL(blob);

		// 	const link = document.createElement('a');
		// 	link.href = url;
		// 	link.download = 'uploadDataFormat.xlsx';
		// 	// link.download = 'Format.xlsx';

		// 	document.body.appendChild(link);
		// 	link.click();
		// 	link.remove();
		// 	window.URL.revokeObjectURL(url);
		// } catch (err) {
		// 	console.error('Download failed:', err);
		// 	setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download report.');
		// }
	}

	// useEffect(() => {
	// 	if (!course || !academicYear) {
	// 		setSubjectList([]);
	// 		setIsDisabled(true);
	// 		return;
	// 	}
	// 	const fetchSubjects = async () => {
	// 		try {
	// 			let res;
	// 			if (userData.role === 'admin') {
	// 				res = await axios.get(`/sub/year/${academicYear}/course/${course}`);
	// 			} else {
	// 				res = await axios.get('/assignSub/sub', {
	// 					params: {
	// 						year: academicYear,
	// 						course
	// 					}
	// 				});
	// 			}
	// 			if (res.data.data.length === 0) {
	// 				setErrorMsg('No data for the selected year and course!');
	// 				setSubjectList([]);
	// 				setIsDisabled(true);
	// 				return;
	// 			}
	// 			setSubjectList(res.data.data);
	// 			setIsDisabled(false);
	// 			setErrorMsg('');
	// 		} catch (err) {
	// 			console.log('Error fetching subjects || ', err);
	// 			setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to fetch subjects!');
	// 			setSubjectList([]);
	// 			setIsDisabled(true);
	// 		}
	// 	};
	// 	fetchSubjects();
	// }, [academicYear, course]);

	return (
		<div
			className="h-full w-full rounded-2xl border border-gray-200 bg-white/30 p-4 sm:p-5 lg:p-6"
			style={{ backgroundColor: COLORS.latte }}
		>
			{/* Header */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<h2
						className="text-xl font-semibold sm:text-2xl"
						style={{ color: COLORS.mintDark }}
					>
						Generate Sheet
					</h2>

					<p className="mt-1 text-sm text-gray-600 sm:text-base">
						Select the academic details and upload the marks to generate sheet.
					</p>
				</div>

				<button
					onClick={handleDownloadFormat}
					className="w-full rounded-xl border border-gray-400 bg-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 sm:w-auto cursor-pointer"
				>
					Download Format
				</button>
			</div>

			{/* Selection Card */}
			<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

					<div>
						<label
							className="mb-2 block text-sm font-semibold"
							style={{ color: COLORS.mintDark }}
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

					<div>
						<label
							className="mb-2 block text-sm font-semibold"
							style={{ color: COLORS.mintDark }}
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
				</div>

				{/* Upload */}
				<div className="mt-6">
					<label
						className="mb-2 block text-sm font-semibold"
						style={{ color: COLORS.mintDark }}
					>
						Internal Marks File
					</label>

					<div className="flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white sm:flex-row sm:items-center">

						<label
							className="cursor-pointer border-b border-gray-300 px-4 py-3 text-center text-sm font-medium transition hover:bg-gray-100 sm:border-b-0 sm:border-r"
							style={{
								backgroundColor: COLORS.latteDark,
								color: COLORS.mintDark,
							}}
						>
							Choose File

							<input
								ref={internalMarksFileInputRef}
								type="file"
								accept=".xls,.xlsx"
								className="hidden"
								onChange={handleInternalMarksFileChange}
							/>
						</label>

						<div className="min-w-0 flex-1 truncate px-4 py-3 text-sm text-gray-600">
							{internalMarksFile ? internalMarksFile.name : "No file selected"}
						</div>

						{internalMarksFile && (
							<button
								type="button"
								onClick={handleInternalMarksRemoveFile}
								className="flex items-center justify-center px-4 py-3 text-gray-500 transition hover:text-red-700 cursor-pointer sm:px-3"
							>
								<IoMdClose className="h-6 w-6" />
								{/* <MdOutlineCancelPresentation className="h-6 w-6" /> */}
							</button>
						)}
					</div>

					<p className="mt-2 text-xs text-gray-500">
						Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
					</p>
				</div>

				<div className="mt-6">
					<label
						className="mb-2 block text-sm font-semibold"
						style={{ color: COLORS.mintDark }}
					>
						External Marks File
					</label>

					<div className="flex flex-col overflow-hidden rounded-xl border border-gray-300 bg-white sm:flex-row sm:items-center">

						<label
							className="cursor-pointer border-b border-gray-300 px-4 py-3 text-center text-sm font-medium transition hover:bg-gray-100 sm:border-b-0 sm:border-r"
							style={{
								backgroundColor: COLORS.latteDark,
								color: COLORS.mintDark,
							}}
						>
							Choose File

							<input
								ref={internalMarksFileInputRef}
								type="file"
								accept=".xls,.xlsx"
								className="hidden"
								onChange={handleExternalMarksFileChange}
							/>
						</label>

						<div className="min-w-0 flex-1 truncate px-4 py-3 text-sm text-gray-600">
							{externalMarksFile ? externalMarksFile.name : "No file selected"}
						</div>

						{externalMarksFile && (
							<button
								type="button"
								onClick={handleExternalMarksRemoveFile}
								className="flex items-center justify-center px-4 py-3 text-gray-500 transition hover:text-red-700 cursor-pointer sm:px-3"
							>
								<IoMdClose className="h-6 w-6" />
								{/* <MdOutlineCancelPresentation className="h-6 w-6" /> */}
							</button>
						)}
					</div>

					<p className="mt-2 text-xs text-gray-500">
						Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
					</p>
				</div>

				{/* Footer */}
				<div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

					<div className="min-w-0 flex-1">
						<ErrorSuccessMsg
							errorMsg={errorMsg}
							successMsg={successMsg}
							setSuccessMsg={setSuccessMsg}
						/>
					</div>

					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">

						{generating && <Loading type="generate" />}

						<button
							onClick={handleGenerate}
							className="w-full rounded-xl px-6 py-3 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
							style={{
								backgroundColor: COLORS.mint,
								color: COLORS.font,
							}}
						>
							Generate Sheet
						</button>

					</div>

				</div>
			</div>
		</div>
	)
}

export default GenerateSheet