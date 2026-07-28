import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Attainment } from './Attainment/index';
import { COLORS } from '../constants/theme';
import { ErrorSuccessMsg } from './index';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import useDocumentTitle from '../hooks/useDocumentTitle';

function FetchData() {
	const userData = useSelector(state => state.auth.userData);

	const [academicYear, setAcademicYear] = useState('')
	const [course, setCourse] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [isDisabled, setIsDisabled] = useState(true);
	const [subjectList, setSubjectList] = useState([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [fetchClicked, setFetchClicked] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	// const [coAttainData, setCOAttainData] = useState({});
	// const [finalCOAttainData, setFinalCOAttainData] = useState({});
	// const [poAttainData, setPOAttainData] = useState({});

	const currentYear = new Date().getFullYear();
	const yearList = [2024];

	useDocumentTitle('Fetch Data - Menu');

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

	return !fetchClicked ? (
		<div
			className="h-full w-full rounded-2xl border border-gray-200 bg-white/30 p-4 sm:p-5 lg:p-6"
			style={{ backgroundColor: COLORS.latte }}
		>
			{/* Header */}
			<div className="mb-6">
				<h2
					className="text-xl font-semibold sm:text-2xl"
					style={{ color: COLORS.mintDark }}
				>
					Fetch Data
				</h2>

				<p className="mt-1 text-sm text-gray-600 sm:text-base">
					Select the academic details to retrieve the uploaded marks.
				</p>
			</div>

			{/* Form Card */}
			<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

					{/* Academic Year */}
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
									option => option.value === academicYear
								) || null
							}
							onChange={selected =>
								handleYear(selected?.value || "")
							}
							maxMenuHeight={180}
						/>
					</div>

					{/* Course */}
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
									option => option.value === course
								) || null
							}
							onChange={selected =>
								handleCourse(selected?.value || "")
							}
							maxMenuHeight={180}
						/>
					</div>

					{/* Subject */}
					<div>
						<label
							className="mb-2 block text-sm font-semibold"
							style={{ color: COLORS.mintDark }}
						>
							Subject
						</label>

						<Select
							options={subjectOptions}
							placeholder="Select subject"
							value={
								subjectOptions.find(
									option => option.value === subjectId
								) || null
							}
							onChange={selected =>
								setSubjectId(selected?.value || "")
							}
							isDisabled={isDisabled}
							maxMenuHeight={180}
						/>
					</div>

				</div>

				{/* Footer */}
				<div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

					<div className="min-w-0 flex-1">
						<ErrorSuccessMsg
							errorMsg={errorMsg}
						/>
					</div>

					<button
						onClick={handleFetch}
						className="w-full rounded-xl px-6 py-3 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
						style={{
							backgroundColor: COLORS.mint,
							color: COLORS.font,
						}}
					>
						Fetch Data
					</button>

				</div>

			</div>
		</div>

		// <div
		// 	className="h-full rounded-2xl border border-gray-200 p-5"
		// 	style={{ backgroundColor: COLORS.latte }}
		// >
		// 	{/* Header */}
		// 	<div className="mb-5">
		// 		<h2
		// 			className="text-xl font-semibold"
		// 			style={{ color: COLORS.mintDark }}
		// 		>
		// 			Fetch Data
		// 		</h2>

		// 		<p className="mt-1 text-sm text-gray-600">
		// 			Select the academic details to retrieve the uploaded marks.
		// 		</p>
		// 	</div>

		// 	{/* Form Card */}
		// 	<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

		// 		<div className="grid gap-4 md:grid-cols-3">

		// 			{/* Academic Year */}
		// 			<div>
		// 				<label
		// 					className="mb-2 block text-sm font-semibold"
		// 					style={{ color: COLORS.mintDark }}
		// 				>
		// 					Academic Year
		// 				</label>

		// 				<Select
		// 					options={yearOptions}
		// 					placeholder="Select year"
		// 					value={yearOptions.find(option => option.value === academicYear) || null}
		// 					onChange={selected => handleYear(selected?.value || "")}
		// 					maxMenuHeight={180}
		// 				/>
		// 			</div>

		// 			{/* Course */}
		// 			<div>
		// 				<label
		// 					className="mb-2 block text-sm font-semibold"
		// 					style={{ color: COLORS.mintDark }}
		// 				>
		// 					Course
		// 				</label>

		// 				<Select
		// 					options={courseOptions}
		// 					placeholder="Select course"
		// 					value={courseOptions.find(option => option.value === course) || null}
		// 					onChange={selected => handleCourse(selected?.value || "")}
		// 					maxMenuHeight={180}
		// 				/>
		// 			</div>

		// 			{/* Subject */}
		// 			<div>
		// 				<label
		// 					className="mb-2 block text-sm font-semibold"
		// 					style={{ color: COLORS.mintDark }}
		// 				>
		// 					Subject
		// 				</label>

		// 				<Select
		// 					options={subjectOptions}
		// 					placeholder="Select subject"
		// 					value={subjectOptions.find(option => option.value === subjectId) || null}
		// 					onChange={selected => setSubjectId(selected?.value || "")}
		// 					isDisabled={isDisabled}
		// 					maxMenuHeight={180}
		// 				/>
		// 			</div>

		// 		</div>

		// 		{/* Footer */}
		// 		<div className="mt-6 flex items-center justify-between">

		// 			<ErrorSuccessMsg
		// 				errorMsg={errorMsg}
		// 			/>

		// 			<button
		// 				onClick={handleFetch}
		// 				className="rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
		// 				style={{
		// 					backgroundColor: COLORS.mint,
		// 					color: COLORS.font,
		// 				}}
		// 			>
		// 				Fetch Data
		// 			</button>

		// 		</div>

		// 	</div>
		// </div>

		// <div className='h-full flex flex-col p-4'>
		// 	<div className='flex justify-between pb-4'>
		// 		<div
		// 			className='text-xl font-semibold'
		// 			style={{ color: COLORS.mint }}
		// 		>
		// 			Fetch Data
		// 		</div>
		// 	</div>
		// 	<div className='w-full flex gap-4'>
		// 		<div className='flex-1'>
		// 			<Select
		// 				options={yearOptions}
		// 				placeholder='Select a year'
		// 				value={yearOptions.find(option => (
		// 					option.value === academicYear
		// 				))}
		// 				onChange={selected => handleYear(selected?.value || '')}
		// 				maxMenuHeight={300}
		// 			/>
		// 		</div>
		// 		<div className='flex-1'>
		// 			<Select
		// 				options={courseOptions}
		// 				placeholder='Select a course'
		// 				value={courseOptions.find(option => (
		// 					option.value === course
		// 				))}
		// 				onChange={selected => handleCourse(selected?.value || '')}
		// 				maxMenuHeight={300}
		// 			/>
		// 		</div>
		// 		<div className='flex-1'>
		// 			<Select
		// 				options={subjectOptions}
		// 				placeholder='Select a subject'
		// 				value={subjectOptions.find(option => (
		// 					option.value === subjectId
		// 				))}
		// 				onChange={selected => setSubjectId(selected?.value || '')}
		// 				isDisabled={isDisabled}
		// 				maxMenuHeight={300}
		// 			/>
		// 		</div>
		// 	</div>

		// 	<div className='flex gap-5 my-7'>
		// 		<div className='flex-1'>
		// 			<button
		// 				onMouseEnter={() => setIsHovered(true)}
		// 				onMouseLeave={() => setIsHovered(false)}
		// 				className='w-1/5 rounded-sm p-1 cursor-pointer duration-200'
		// 				style={{
		// 					backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
		// 					color: COLORS.font
		// 				}}
		// 				onClick={handleFetch}
		// 			>
		// 				Fetch
		// 			</button>
		// 		</div>
		// 	</div>
		// 	<ErrorSuccessMsg
		// 		errorMsg={errorMsg}
		// 	/>
		// </div>
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
				setFetchClicked={setFetchClicked}
			/>
		)
}

export default FetchData