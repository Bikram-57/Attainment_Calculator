import React, { useRef, useState } from 'react'
import axios from 'axios'
import { MdOutlineCancelPresentation } from "react-icons/md";

function UploadData() {
	const [isDisabled, setIsDisabled] = useState(true);
	const [subjectId, setsubjectId] = useState('')
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [file, setFile] = useState(null);
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const fileInputRef = useRef(null);

	const currentYear = new Date().getFullYear();
	const yearList = [2024];
	for (let year = yearList[0] + 1; year <= currentYear; year++) {
		yearList.push(year);
	}

	const handleCourse = (e) => {
		setCourse(e.target.value);
		course !== '' ? setIsDisabled(true) : setIsDisabled(false);
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
			setError('');
			setSuccessMsg(res.data.message);
			console.log(res);
		} catch (err) {
			console.log("Error on handleUpload || ", err);
			setError("Something wrong occured on uploading the file!");
		}
	}

	return (
		<div className='h-full flex flex-col p-4'>
			<div className='flex justify-between pb-4'>
				<div className='text-blue-900 text-xl font-semibold'>Upload Data</div>
			</div>
			<div className='w-full flex gap-4'>
				<select
					className='border border-gray-300 rounded-sm flex-1 px-2 py-1'
					value={academicYear}
					onChange={(e) => setAcademicYear(e.target.value)}
				>
					<option value=''>Select a year</option>
					{yearList.map(year => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
				<select
					className='border border-gray-300 rounded-sm flex-1 px-2 py-1'
					value={course}
					onChange={handleCourse}
				>
					<option value=''>Select a course</option>
					<option value='BCA'>BCA</option>
					<option value='MCA'>MCA</option>
				</select>
				{/* TODO: FETCH DATA DYNAMICALLY FOR SUBJECT ID BELOW */}
				<select
					className={`${isDisabled ? 'bg-gray-50 text-gray-400' : null} border border-gray-300 rounded-sm flex-1 px-2 py-1`}
					value={subjectId}
					onChange={(e) => setsubjectId(e.target.value)}
					disabled={isDisabled}
				>
					<option value=''>Select a subject</option>
					<option value='CA101'>CA101</option>
					<option value='value 2'>value 2</option>
					<option value='value 3'>value 3</option>
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
							<MdOutlineCancelPresentation className='h-full w-[25px] cursor-pointer text-red-600' />
						</div>
					)}
				</div>
				<div className='flex-1'>
					<button
						className='bg-blue-900 w-1/2 rounded-sm text-white p-1 cursor-pointer hover:bg-blue-800 duration-200'
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
				<p className="text-green-500 text-sm ml-2">
					{successMsg}
				</p>
			</div>
		</div>
	)
}

export default UploadData