import React, { useState, useEffect } from 'react'
import { COLORS } from '../../constants/theme'
import axios from 'axios';
import { ErrorSuccessMsg } from '../index';
import { Loading } from '../index';
import Select from 'react-select';
import { useSelector } from 'react-redux';

function DownloadSubjectReport() {
	const userData = useSelector(state => state.auth.userData);
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [isDisabled, setIsDisabled] = useState(true);
	const [subjectList, setSubjectList] = useState([]);
	const [isHovered, setIsHovered] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [downloading, setDownloading] = useState(false);

	const currentYear = new Date().getFullYear();
	const yearList = [2024];
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

	const handleYear = (selectedYear) => {
		setAcademicYear(selectedYear);
		setSubjectId('');
	}

	const handleCourse = (selectedCourse) => {
		setCourse(selectedCourse);
		setSubjectId('');
	}

	const handleDownload = async () => {
		if (academicYear.length === 0 || course.length === 0 || subjectId.length === 0) {
			setErrorMsg('Please fill all the fields!');
			return;
		}
		setErrorMsg('');
		try {
			setDownloading(true);
			const response = await axios.get('/file/download', {
				params: {
					subjectId,
					course,
					academicYear,
				},
				responseType: 'blob',
			});

			const blob = new Blob([response.data]);
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;

			link.download = `Subject_Report_${subjectId}_${academicYear}.xlsx`;

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
			<div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
				<div
					className="text-xl font-semibold"
					style={{ color: COLORS.mint }}
				>
					Download Subject Report
				</div>
			</div>
			<div className='w-full flex gap-4'>
				<div className='flex-1'>
					<Select
						options={yearOptions}
						placeholder='Select a year'
						value={yearOptions.find(option => (
							option.value === academicYear
						))}
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
						))}
						onChange={selected => handleCourse(selected?.value || '')}
						maxMenuHeight={300}
					/>
				</div>
				<div className='flex-1'>
					<Select
						options={subjectOptions}
						placeholder='Select a subject'
						value={subjectOptions.find(option => (
							option.value === subjectId
						))}
						onChange={selected => setSubjectId(selected?.value || '')}
						isDisabled={isDisabled}
						maxMenuHeight={300}
					/>
				</div>
			</div>

			<div className='flex gap-5 my-7'>
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

export default DownloadSubjectReport