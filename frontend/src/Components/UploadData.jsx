import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { MdOutlineCancelPresentation } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { COLORS } from '../constants/theme'

function UploadData() {
	const [isDisabled, setIsDisabled] = useState(true);
	const [subjectId, setSubjectId] = useState('')
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [file, setFile] = useState(null);
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [allSubjects, setAllSubjects] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [isHovered, setIsHovered] = useState(false);

	const fileInputRef = useRef(null);

	const currentYear = new Date().getFullYear();
	const yearList = [2024];
	for (let year = yearList[0] + 1; year <= currentYear; year++) {
		yearList.push(year);
	}

	const handleCourse = async (e) => {
		const selectedCourse = e.target.value;
		setCourse(selectedCourse);
		if (!selectedCourse) {
			setSubjectList([]);
			setIsDisabled(true);
			return;
		}
		const filteredSubjects = allSubjects.filter(sub => (
			sub.course === selectedCourse && sub.year == academicYear
		));

		setSubjectList(filteredSubjects);
		(selectedCourse === '' || academicYear == '') ? setIsDisabled(true) : setIsDisabled(false);
	}

	const handleYear = (e) => {
		const selectedYear = e.target.value;
		setAcademicYear(selectedYear);
		if (!selectedYear) {
			setAcademicYear('');
			setIsDisabled(true);
			return;
		}
		const filteredSubjects = allSubjects.filter(sub => (
			sub.year == selectedYear && sub.course == course
		));

		setSubjectList(filteredSubjects);
		(selectedYear === '' || course == '') ? setIsDisabled(true) : setIsDisabled(false);
	}

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];

		const validTypes = [
			"application/vnd.ms-excel", // .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		];

		if (!selectedFile) return;
		if (!validTypes.includes(selectedFile.type)) {
			setError('Only Excel files (.xls, .xlsx) are allowed');
			setFile(null);
			return;
		}

		setError('');
		setFile(selectedFile);
	}

	const handleRemoveFile = () => {
		setFile(null);
		fileInputRef.current.value = '';
	}

	const handleUpload = async () => {
		if (!subjectId || !academicYear || !course) {
			setError("Please fill all the fields");
			return;
		}
		if (!file) {
			setError("Please choose a file!");
			return;
		}

		const formData = new FormData();
		formData.append('excelFile', file);
		formData.append('subjectId', subjectId);
		formData.append('academicYear', academicYear);
		formData.append('course', course);

		try {
			const res = await axios.post('/mark/upload-raw', formData);
			setSuccessMsg(res.data.message);
			setError('');
			setFile(null);
			setAcademicYear('');
			setCourse('');
			setSubjectId('');
			setIsDisabled(true);
			console.log(res);
		} catch (err) {
			setError("Something went wrong! Format error!");
			console.log("Error on handleUpload || ", err);
		}
	}

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const res = await axios.get('/sub/');
				setAllSubjects(res.data.data);
			} catch (err) {
				console.log('Error fetching subjects || ', err);
			}
		};

		fetchSubjects();
	}, []);

	useEffect(() => {
		if (!successMsg) return;
		const timer = setTimeout(() => {
			setSuccessMsg("");
		}, 3000);
		return () => clearTimeout(timer);
	}, [successMsg])

	return (
		<div className='h-full flex flex-col p-4'>
			<div className='flex justify-between pb-4'>
				<div
					className='text-xl font-semibold'
					style={{ color: COLORS.mint }}
				>
					Upload Data
				</div>
			</div>
			<div className='w-full flex gap-4'>
				<select
					className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
					style={{ backgroundColor: COLORS.font }}
					value={academicYear}
					onChange={handleYear}
				>
					<option value=''>Select a year</option>
					{yearList.map(year => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
				<select
					className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
					style={{ backgroundColor: COLORS.font }}
					value={course}
					onChange={handleCourse}
				>
					<option value=''>Select a course</option>
					<option value='BCA'>BCA</option>
					<option value='MCA'>MCA</option>
				</select>
				{/* TODO: FIX MAX HEIGHT OF THE DROPDOWN MENU */}
				<select
					className={`${isDisabled ? 'cursor-not-allowed text-gray-400' : null} border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none h-8`}
					style={{backgroundColor: isDisabled ? COLORS.latteDark : COLORS.font}}
					value={subjectId}
					onChange={(e) => setSubjectId(e.target.value)}
					disabled={isDisabled}
				>
					<option value=''>Select a subject</option>
					{subjectList.map(sub => (
						<option key={sub.subjectId} value={sub.subjectId}>
							{sub.subjectId} - {sub.subjectName}
						</option>
					))}
				</select>

			</div>

			<div className='flex gap-5 my-7'>
				<div className='flex w-3/5 border-2 border-gray-300 rounded-sm'>
					<label className='bg-gray-200 border-gray-300 px-3 border-r-2 cursor-pointer'>
						Choose File
						<input
							ref={fileInputRef}
							type='file'
							accept='.xls, .xlsx'
							className='hidden'
							onChange={handleFileChange}
						/>
					</label>
					<div className='w-2/3 mx-2'>
						{!file ? 'No file choose' : file.name}
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
				<div className='flex-1'>
					<button
						className='w-1/2 rounded-sm p-1 cursor-pointer duration-200'
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
				</div>
			</div>
			<div>
				{error && (
					<p className="text-red-500 text-sm ml-2">
						{error}
					</p>
				)}
				{successMsg && (
					<p className="text-sm ml-2 flex">
						<MdDone className='text-green-500 h-full w-5 mx-1 order rounded-full' />
						{successMsg}
					</p>
				)}
			</div>
		</div>
	)
}

export default UploadData