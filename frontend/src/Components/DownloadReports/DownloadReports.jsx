import React, { useState, useEffect } from 'react'
import { COLORS } from '../../constants/theme'
import axios from 'axios';
import ErrorSuccessMsg from '../ErrorSuccessMsg';
import Loading from '../Loading';

function DownloadReports() {
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [isDisabled, setIsDisabled] = useState(true);
	const [allSubjects, setAllSubjects] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [isHovered, setIsHovered] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [downloading, setDownloading] = useState(false);
	const [reportType, setReportType] = useState("subject");

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
			sub.course === selectedCourse && sub.academicYear == academicYear
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
			sub.academicYear == selectedYear && sub.course == course
		));

		setSubjectList(filteredSubjects);
		(selectedYear === '' || course == '') ? setIsDisabled(true) : setIsDisabled(false);
	}

	const handleDownload = async () => {
		if (
			academicYear.length === 0 ||
			course.length === 0 ||
			(reportType === 'subject' && subjectId.length === 0)
		) {
			setErrorMsg('Please fill all the fields!');
			return;
		}

		setErrorMsg('');

		try {
			setDownloading(true);
			let response;
			if (reportType === 'subject') {
				response = await axios.get('/file/download', {
					params: {
						subjectId,
						course,
						academicYear,
					},
					responseType: 'blob',
				});
			} else {
				response = await axios.post(
					'/report/direct-po',
					{
						course,
						academicYear,
					},
					{
						responseType: 'blob',
					}
				);
			}

			const blob = new Blob([response.data]);
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;

			link.download = (reportType === 'subject')
				? `Subject_Report_${subjectId}_${academicYear.replace(/\//g, '-')}.xlsx`
				: `Batch_Report_${course}_${academicYear.replace(/\//g, '-')}.xlsx`;

			document.body.appendChild(link);
			link.click();

			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			if (error.response?.status === 404) {
				setErrorMsg('Data not available!');
			} else {
				console.error('Download failed:', error);
				setErrorMsg('Failed to download report.');
			}
		} finally {
			setDownloading(false);
		}
	};

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

	return (
		<div className='h-full flex flex-col p-4'>
			<div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
				<div
					className="text-xl font-semibold"
					style={{ color: COLORS.mint }}
				>
					Download Reports
				</div>

				<div className="flex items-center gap-6">
					<label className="font-semibold flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="reportType"
							value="subject"
							checked={reportType === "subject"}
							onChange={(e) => setReportType(e.target.value)}
						/>
						<span>Subject Report</span>
					</label>

					<label className="font-semibold flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="reportType"
							value="batch"
							checked={reportType === "batch"}
							onChange={(e) => setReportType(e.target.value)}
						/>
						<span>Batch Report</span>
					</label>
				</div>
			</div>
			{/* <div className='flex justify-between pb-4'>
				<div
					className='text-xl font-semibold'
					style={{ color: COLORS.mint }}
				>
					Fetch data to download
				</div>
			</div> */}
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
				{reportType === 'subject' ? (
					<select
						className={`${isDisabled ? 'cursor-not-allowed text-gray-400' : null} border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none h-8`}
						style={{ backgroundColor: isDisabled ? COLORS.latteDark : COLORS.font }}
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
					</select>) : null
				}

			</div>

			<div className='flex gap-5 my-7'>
				{/* <div className='flex-1'>
					<button
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						className='w-1/5 rounded-sm p-1 cursor-pointer duration-200'
						style={{
							backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
							color: COLORS.font
						}}
						onClick={handleDownload}
					>
						Download
					</button>
				</div> */}
				<div className='flex w-full h-4 items-center'>
					<button
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						className='w-1/5 rounded-sm p-1 cursor-pointer duration-200'
						style={{
							backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
							color: COLORS.font
						}}
						onClick={handleDownload}
					>
						Download
					</button>
					{downloading && <Loading type='download' />}
				</div>
			</div>
			<ErrorSuccessMsg
				errorMsg={errorMsg}
			/>
		</div>
	)
}

export default DownloadReports