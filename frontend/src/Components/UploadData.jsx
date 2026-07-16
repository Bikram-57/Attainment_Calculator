import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { MdOutlineCancelPresentation } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { COLORS } from '../constants/theme';
import { ErrorSuccessMsg } from './index';
import { Loading } from './index';
import Select from "react-select";
import { useSelector } from 'react-redux';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

function UploadData() {
	const userData = useSelector(state => state.auth.userData);
	const fileInputRef = useRef(null);
	
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [file, setFile] = useState(null);
	const [isDisabled, setIsDisabled] = useState(true);
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [subjectList, setSubjectList] = useState([]);
	const [isHovered, setIsHovered] = useState(false);
	const [uploading, setUploading] = useState(false);

	useDocumentTitle('Upload Data - Menu');

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

	const subjectOptions = subjectList.map((sub) => (
		{
			value: sub.subjectId,
			label: `${sub.subjectId} - ${sub.subjectName}`,
		}
	));

	const handleCourse = (selectedCourse) => {
		setCourse(selectedCourse);
		setSubjectId('');
	}

	const handleYear = (selectedYear) => {
		setAcademicYear(selectedYear);
		setSubjectId('');
	}

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];

		const validTypes = [
			"application/vnd.ms-excel", // .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		];

		if (!selectedFile) return;
		if (!validTypes.includes(selectedFile.type)) {
			setErrorMsg('Only Excel files (.xls, .xlsx) are allowed');
			setFile(null);
			return;
		}

		setErrorMsg('');
		setFile(selectedFile);
	}

	const handleRemoveFile = () => {
		setFile(null);
		fileInputRef.current.value = '';
	}

	const handleUpload = async () => {
		if (!subjectId || !academicYear || !course) {
			setErrorMsg("Please fill all the fields");
			return;
		}
		if (!file) {
			setErrorMsg("Please choose a file!");
			return;
		}
		setUploading(true);
		const formData = new FormData();
		formData.append('excelFile', file);
		formData.append('subjectId', subjectId);
		formData.append('academicYear', academicYear);
		formData.append('course', course);

		setErrorMsg('');
		try {
			const res = await axios.post('/mark/upload-raw', formData);
			setSuccessMsg(res.data.message);
			setFile(null);
			setAcademicYear('');
			setCourse('');
			setSubjectId('');
			setIsDisabled(true);
			console.log(res);
		} catch (err) {
			// setErrorMsg("Something went wrong! Format error!");
			setErrorMsg(err?.response?.data?.message || 'Something went wrong!');
			console.log("Error on handleUpload || ", err);
		} finally {
			setUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	}

	const handleDownloadFormat = async () => {
		try {
			const response = await axios.get('/download-format/',
				{
					responseType: 'blob',
				}
			);

			const blob = new Blob([response.data]);
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = 'Format.xlsx';

			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
			setErrorMsg('Failed to download report.');
		}
	}

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
				console.log('Error fetching subjects || ', err);
				setErrorMsg(err?.response?.data?.message);
				setSubjectList([]);
				setIsDisabled(true);
			}
		};
		fetchSubjects();
	}, [academicYear, course]);

	return (
		<div className='h-full flex flex-col p-4'>
			<div className='flex justify-between pb-4'>
				<div
					className='text-xl font-semibold'
					style={{ color: COLORS.mint }}
				>
					Upload Data
				</div>
				<button
					className='text-md border rounded-md px-2 font-semibold cursor-pointer'
					onClick={handleDownloadFormat}
				>
					Download Format
				</button>
			</div>
			<div className='w-full flex gap-4'>
				<div className='flex-1'>
					<Select
						options={yearOptions}
						placeholder='Select a year'
						value={yearOptions.find(option => (
							option.value === academicYear
						)) || null}
						onChange={selected => handleYear(selected?.value || '')}
						maxMenuHeight={300}
					/>
				</div>
				<div className='flex-1'>
					<Select
						options={courseOptions}
						placeholder='Select a course'
						value={courseOptions.find(option => (
							option.value === course
						)) || null}
						onChange={selected => handleCourse(selected?.value || '')}
						maxMenuHeight={300}
					/>
				</div>

				<div className="flex-1">
					<Select
						options={subjectOptions}
						placeholder='Select a subject'
						value={subjectOptions.find((option) => (
							option.value === subjectId
						)) || null}
						onChange={(selected) => setSubjectId(selected?.value || "")}
						isDisabled={isDisabled}
						maxMenuHeight={300}
					/>
				</div>
			</div>

			<div className='flex gap-5 my-7'>
				<div
					className='flex w-3/5 border-2 border-gray-300 rounded-sm'
					style={{ backgroundColor: COLORS.font }}
				>
					<label className='bg-gray-200 border-gray-300 px-3 border-r-2 cursor-pointer'>
						Select File
						<input
							ref={fileInputRef}
							type='file'
							accept='.xls, .xlsx'
							className='hidden'
							onChange={handleFileChange}
						/>
					</label>
					<div
						className='w-2/3 mx-2'
						style={{ backgroundColor: COLORS.font }}
					>
						{!file ? 'No file selected' : file.name}
					</div>
					{file && (
						<div
							className='ml-auto mr-2'
							onClick={handleRemoveFile}
						>
							<MdOutlineCancelPresentation className='h-full w-6.25 cursor-pointer text-red-600' />
						</div>
					)}
				</div>
				<div className='flex w-4/5 items-center'>
					<button
						className='w-1/3 rounded-sm p-1 cursor-pointer duration-200'
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						style={{
							backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
							color: COLORS.font
						}}
						onClick={handleUpload}
					>
						Upload
					</button>
					{uploading && <Loading type='upload' />}
				</div>
			</div>
			<ErrorSuccessMsg
				errorMsg={errorMsg}
				successMsg={successMsg}
				setSuccessMsg={setSuccessMsg}
			/>
		</div>
	)
}

export default UploadData