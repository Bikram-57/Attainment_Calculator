import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Attainment } from './Attainment/index';
import { COLORS } from '../constants/theme';
import ErrorSuccessMsg from './ErrorSuccessMsg';

function FetchData() {
	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [isDisabled, setIsDisabled] = useState(true);
	const [allSubjects, setAllSubjects] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [fetchClicked, setFetchClicked] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	// const [coAttainData, setCOAttainData] = useState({});
	// const [finalCOAttainData, setFinalCOAttainData] = useState({});
	// const [poAttainData, setPOAttainData] = useState({});

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

	// const handleFetch = async () => {
	// 	const params = {
	// 		academicYear: academicYear,
	// 		course: course,
	// 		subjectId: subjectId
	// 	}
	// 	try {
	// 		const [res1, res2, res3] = await Promise.all([
	// 			axios.get('/mark/get-calculations', { params: params }),
	// 			axios.get('/mark/get-final-attainment', { params: params }),
	// 			axios.get('/co-po/relation', { params: params }),
	// 		]);
	// 		setCOAttainData(res1.data);
	// 		setFinalCOAttainData(res2.data);
	// 		setPOAttainData(res3.data);
	// 	} catch (error) {
	// 		console.log(error);
	// 	}

	// 	setIsFetching(true)
	// }

	const handleFetch = () => {
		if (academicYear.length === 0 || course.length === 0 || subjectId.length === 0) {
			setErrorMsg('Please fill all the fields!');
			return;
		}
		setErrorMsg('');
		setFetchClicked(true);
	}

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const res = await axios.get('/sub/');
				console.log('yes');

				setAllSubjects(res.data.data);
			} catch (err) {
				console.log('Error fetching subjects || ', err);
			}
		};

		fetchSubjects();
	}, []);

	// return !isFetching ? (
	return !fetchClicked ? (
		<div className='h-full flex flex-col p-4'>
			<div className='flex justify-between pb-4'>
				<div
					className='text-blue-900 text-xl font-semibold'
					style={{ color: COLORS.mint }}
				>
					Fetch Data
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
				</select>

			</div>

			<div className='flex gap-5 my-7'>
				<div className='flex-1'>
					<button
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						className='w-1/5 rounded-sm p-1 cursor-pointer duration-200'
						style={{
							backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
							color: COLORS.font
						}}
						onClick={handleFetch}
					>
						Fetch
					</button>
				</div>
			</div>
			<ErrorSuccessMsg
				errorMsg={errorMsg}
			/>
		</div>
	)
		:
		// (coAttainData && (
		// 	<Attainment
		// 		coAttainData={coAttainData}
		// 		finalCOAttainData={finalCOAttainData}
		// 		poAttainData={poAttainData}
		// 	/>
		// ))
		(
			<Attainment
				academicYear={academicYear}
				course={course}
				subjectId={subjectId}
			/>
		)
}

export default FetchData