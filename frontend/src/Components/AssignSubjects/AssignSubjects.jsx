import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import { COLORS } from '../../constants/theme';
import { Loading } from '../index';
import Option1 from './Option1';
import Option2 from './Option2';
import Option3 from './Option3';

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');
	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
	const [updateData, setUpdateData] = useState(false);
	const [loading, setLoading] = useState(true);
	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
	const currentYear = new Date().getFullYear();

	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
		(
			sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
			&& Object.hasOwn(sub.assignments, filterYear)
		)
	));

	useEffect(() => {
		const getAssignSubjects = async () => {
			try {
				const res = await axios.get('/assignSub/');
				setAssignedSubjectsData(res.data.data);
			} catch (error) {
				if (error.status == 409) {
					setErrorMsg('Subject already assigned!');
				}
				else {
					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
				}
			} finally {
				setLoading(false);
			}
		}
		getAssignSubjects();
	}, [updateData]);

	const toggleUpdate = () => {
		setUpdateData(prev => !prev);
	}

	const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
		try {
			const res = await axios.delete('/assignSub/', {
				data: {
					facultyId,
					subjectId,
					course,
					academicYear
				}
			});
			toggleUpdate();
			// console.log(res.data.data);
		} catch (error) {
			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
		}
	}

	return !loading ? (
		<>
			<AssignSubjectsHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
				currentYear={currentYear}
				setFilterYear={setFilterYear}
			/>
			{
				searchQuery === '1' ? (
					<Option1 />
				) : searchQuery === '2' ? (
					<Option2 />
				) : searchQuery === '3' ? (
					<Option3 />
				) : null
			}
		</>
	) : <Loading />
}

export default AssignSubjects















// OPTION 1


// import React, { useEffect, useState } from 'react'
// import AssignSubjectsHeader from './AssignSubjectsHeader'
// import { RiDeleteBin6Line } from "react-icons/ri";
// import axios from 'axios';
// import { COLORS } from '../../constants/theme';
// import { Loading } from '../index';

// function AssignSubjects() {
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
// 	const [updateData, setUpdateData] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
// 	const currentYear = new Date().getFullYear();

// 	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
// 		(
// 			sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
// 			&& Object.hasOwn(sub.assignments, filterYear)
// 		)
// 	));

// 	useEffect(() => {
// 		const getAssignSubjects = async () => {
// 			try {
// 				const res = await axios.get('/assignSub/');
// 				setAssignedSubjectsData(res.data.data);
// 			} catch (error) {
// 				if (error.status == 409) {
// 					setErrorMsg('Subject already assigned!');
// 				}
// 				else {
// 					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
// 				}
// 			} finally {
// 				setLoading(false);
// 			}
// 		}
// 		getAssignSubjects();
// 	}, [updateData]);

// 	const toggleUpdate = () => {
// 		setUpdateData(prev => !prev);
// 	}

// 	const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
// 		try {
// 			const res = await axios.delete('/assignSub/', {
// 				data: {
// 					facultyId,
// 					subjectId,
// 					course,
// 					academicYear
// 				}
// 			});
// 			toggleUpdate();
// 			// console.log(res.data.data);
// 		} catch (error) {
// 			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
// 		}
// 	}

// 	return !loading ? (
// 		<div className='h-full flex flex-col'>
// 			<AssignSubjectsHeader
// 				toggleUpdate={toggleUpdate}
// 				setSearchQuery={setSearchQuery}
// 				currentYear={currentYear}
// 				setFilterYear={setFilterYear}
// 			/>
// 			<div className="flex-1 overflow-y-auto">
// 				{filteredAssignedSubjectsData?.length > 0 ?
// 					(
// 						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 px-4 py-2">
// 							{filteredAssignedSubjectsData.map((data) => (
// 								<div
// 									key={data.facultyId}
// 									className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
// 								>
// 									{/* Faculty Header */}
// 									<div
// 										className="px-4 py-3"
// 										style={{
// 											backgroundColor: COLORS.mint,
// 											color: COLORS.font,
// 										}}
// 									>
// 										<div className="flex items-center justify-between">
// 											<div>
// 												<h3 className="font-semibold text-lg">
// 													{data.facultyName}
// 												</h3>

// 												<p className="text-sm opacity-90">
// 													Faculty ID: {data.facultyId}
// 												</p>
// 											</div>

// 											<div
// 												className="rounded-full px-3 py-1 text-xs font-medium"
// 												style={{
// 													backgroundColor: "rgba(255,255,255,0.2)",
// 												}}
// 											>
// 												{
// 													Object.values(
// 														data.assignments?.[filterYear] || {}
// 													)
// 														.flat()
// 														.length
// 												}{" "}
// 												Subjects
// 											</div>
// 										</div>
// 									</div>

// 									{/* Assigned Subjects */}
// 									<div className="p-4">
// 										{Object.keys(data.assignments?.[filterYear] || {}).length >
// 											0 ? (
// 											Object.entries(
// 												data.assignments?.[filterYear] || {}
// 											).map(([course, subjects]) => (
// 												<div key={course} className="mb-4 last:mb-0">
// 													{/* Course Badge */}
// 													<div className="mb-2 flex items-center justify-between">
// 														<span
// 															className="rounded-md px-2 py-1 text-sm font-semibold"
// 															style={{
// 																backgroundColor:
// 																	COLORS.latteDark,
// 															}}
// 														>
// 															{course}
// 														</span>

// 														<span className="text-xs text-gray-500">
// 															{subjects.length} Subject
// 															{subjects.length > 1 ? "s" : ""}
// 														</span>
// 													</div>

// 													{/* Subject List */}
// 													<div className="space-y-2">
// 														{subjects.map((subject) => (
// 															<div
// 																key={subject.subjectId}
// 																className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
// 															>
// 																<div>
// 																	<div className="font-medium text-slate-800">
// 																		{subject.subjectId}
// 																	</div>

// 																	<div className="text-sm text-slate-500">
// 																		{subject.subjectName}
// 																	</div>
// 																</div>

// 																<button
// 																	className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
// 																	title="De-assign Subject"
// 																	onClick={() =>
// 																		deAssignSubject(
// 																			subject.subjectId,
// 																			data.facultyId,
// 																			course,
// 																			filterYear
// 																		)
// 																	}
// 																>
// 																	<RiDeleteBin6Line size={18} />
// 																</button>
// 															</div>
// 														))}
// 													</div>
// 												</div>
// 											))
// 										) : (
// 											<div className="py-6 text-center text-sm text-gray-500">
// 												No subjects assigned for {filterYear}
// 											</div>
// 										)}
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					) :
// 					(
// 						<div className='text-center text-lg'>No data available</div>
// 					)
// 				}
// 			</div>
// 		</div>
// 	) : <Loading />
// }

// export default AssignSubjects
















// OPTION 2



// import React, { useEffect, useState } from 'react'
// import AssignSubjectsHeader from './AssignSubjectsHeader'
// import { RiDeleteBin6Line } from "react-icons/ri";
// import axios from 'axios';
// import { COLORS } from '../../constants/theme';
// import { Loading } from '../index';

// function AssignSubjects() {
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
// 	const [updateData, setUpdateData] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
// 	const currentYear = new Date().getFullYear();

// 	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
// 		(
// 			sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
// 			&& Object.hasOwn(sub.assignments, filterYear)
// 		)
// 	));

// 	useEffect(() => {
// 		const getAssignSubjects = async () => {
// 			try {
// 				const res = await axios.get('/assignSub/');
// 				setAssignedSubjectsData(res.data.data);
// 			} catch (error) {
// 				if (error.status == 409) {
// 					setErrorMsg('Subject already assigned!');
// 				}
// 				else {
// 					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
// 				}
// 			} finally {
// 				setLoading(false);
// 			}
// 		}
// 		getAssignSubjects();
// 	}, [updateData]);

// 	const toggleUpdate = () => {
// 		setUpdateData(prev => !prev);
// 	}

// 	const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
// 		try {
// 			const res = await axios.delete('/assignSub/', {
// 				data: {
// 					facultyId,
// 					subjectId,
// 					course,
// 					academicYear
// 				}
// 			});
// 			toggleUpdate();
// 			// console.log(res.data.data);
// 		} catch (error) {
// 			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
// 		}
// 	}

// 	return !loading ? (
// 		<div className='h-full flex flex-col'>
// 			<AssignSubjectsHeader
// 				toggleUpdate={toggleUpdate}
// 				setSearchQuery={setSearchQuery}
// 				currentYear={currentYear}
// 				setFilterYear={setFilterYear}
// 			/>
// 			<div className="flex-1 overflow-y-auto px-4 py-3">
// 				{filteredAssignedSubjectsData?.length > 0 ?
// 					(
// 						<div className="space-y-4">
// 							{filteredAssignedSubjectsData.map((data) => (
// 								<div
// 									key={data.facultyId}
// 									className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
// 								>
// 									<details>
// 										<summary className="flex cursor-pointer items-center justify-between px-5 py-4">
// 											<div>
// 												<h3 className="text-lg font-semibold text-slate-800">
// 													{data.facultyId} - {data.facultyName}
// 												</h3>

// 												<p className="text-sm text-slate-500">
// 													Academic Year: {filterYear}
// 												</p>
// 											</div>

// 											<span
// 												className="rounded-full px-3 py-1 text-sm font-medium"
// 												style={{
// 													backgroundColor: COLORS.latteDark,
// 												}}
// 											>
// 												{
// 													Object.values(
// 														data.assignments?.[filterYear] || {}
// 													)
// 														.flat()
// 														.length
// 												}{" "}
// 												Subjects
// 											</span>
// 										</summary>
// 										<div className="border-t bg-slate-50 p-4">
// 											<div className="grid gap-4 md:grid-cols-2">
// 												{Object.entries(
// 													data.assignments?.[filterYear] || {}
// 												).map(([course, subjects]) => (
// 													<div
// 														key={course}
// 														className="rounded-xl border border-gray-200 bg-white p-3"
// 													>
// 														<div
// 															className="mb-3 flex items-center justify-between rounded-lg px-3 py-2"
// 															style={{
// 																backgroundColor: COLORS.mint,
// 																color: COLORS.font,
// 															}}
// 														>
// 															<span className="font-semibold">{course}</span>

// 															<span className="rounded-full bg-white/20 px-2 py-1 text-xs">
// 																{subjects.length}
// 															</span>
// 														</div>

// 														<div className="space-y-2">
// 															{subjects.map((subject) => (
// 																<div
// 																	key={subject.subjectId}
// 																	className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
// 																>
// 																	<div>
// 																		<div className="font-medium">
// 																			{subject.subjectId}
// 																		</div>

// 																		<div className="text-sm text-slate-500">
// 																			{subject.subjectName}
// 																		</div>
// 																	</div>

// 																	<button
// 																		className="rounded-lg p-2 text-red-500 hover:bg-red-50"
// 																		onClick={() =>
// 																			deAssignSubject(
// 																				subject.subjectId,
// 																				data.facultyId,
// 																				course,
// 																				filterYear
// 																			)
// 																		}
// 																	>
// 																		<RiDeleteBin6Line size={18} />
// 																	</button>
// 																</div>
// 															))}
// 														</div>
// 													</div>
// 												))}
// 											</div>
// 										</div>
// 									</details>
// 								</div>
// 							))}
// 						</div>
// 					) :
// 					(
// 						<div className='text-center text-lg'>No data available</div>
// 					)
// 				}
// 			</div>
// 		</div>
// 	) : <Loading />
// }

// export default AssignSubjects









// OPTION 3




// import React, { useEffect, useState } from 'react'
// import AssignSubjectsHeader from './AssignSubjectsHeader'
// import { RiDeleteBin6Line } from "react-icons/ri";
// import axios from 'axios';
// import { COLORS } from '../../constants/theme';
// import { Loading } from '../index';

// function AssignSubjects() {
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
// 	const [updateData, setUpdateData] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
// 	const currentYear = new Date().getFullYear();

// 	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
// 		(
// 			sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
// 			&& Object.hasOwn(sub.assignments, filterYear)
// 		)
// 	));

// 	useEffect(() => {
// 		const getAssignSubjects = async () => {
// 			try {
// 				const res = await axios.get('/assignSub/');
// 				setAssignedSubjectsData(res.data.data);
// 			} catch (error) {
// 				if (error.status == 409) {
// 					setErrorMsg('Subject already assigned!');
// 				}
// 				else {
// 					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
// 				}
// 			} finally {
// 				setLoading(false);
// 			}
// 		}
// 		getAssignSubjects();
// 	}, [updateData]);

// 	const toggleUpdate = () => {
// 		setUpdateData(prev => !prev);
// 	}

// 	const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
// 		try {
// 			const res = await axios.delete('/assignSub/', {
// 				data: {
// 					facultyId,
// 					subjectId,
// 					course,
// 					academicYear
// 				}
// 			});
// 			toggleUpdate();
// 			// console.log(res.data.data);
// 		} catch (error) {
// 			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
// 		}
// 	}

// 	return !loading ? (
// 		<div className='h-full flex flex-col'>
// 			<AssignSubjectsHeader
// 				toggleUpdate={toggleUpdate}
// 				setSearchQuery={setSearchQuery}
// 				currentYear={currentYear}
// 				setFilterYear={setFilterYear}
// 			/>
// 			<div className="flex-1 overflow-y-auto px-4 py-3">
// 				{filteredAssignedSubjectsData?.length > 0 ?
// 					(
// 						<div className="space-y-4">
// 							{filteredAssignedSubjectsData.map((data) => (
// 								<div
// 									key={data.facultyId}
// 									className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
// 								>
// 									<details>
// 										<summary className="flex cursor-pointer items-center justify-between px-5 py-4">
// 											<div>
// 												<h3 className="text-lg font-semibold text-slate-800">
// 													{data.facultyId} - {data.facultyName}
// 												</h3>

// 												<p className="text-sm text-slate-500">
// 													Academic Year: {filterYear}
// 												</p>
// 											</div>

// 											<span
// 												className="rounded-full px-3 py-1 text-sm font-medium"
// 												style={{
// 													backgroundColor: COLORS.latteDark,
// 												}}
// 											>
// 												{
// 													Object.values(
// 														data.assignments?.[filterYear] || {}
// 													)
// 														.flat()
// 														.length
// 												}{" "}
// 												Subjects
// 											</span>
// 										</summary>

// 										<div className="border-t bg-slate-50 p-4">
// 											{Object.entries(
// 												data.assignments?.[filterYear] || {}
// 											).map(([course, subjects]) => (
// 												<div
// 													key={course}
// 													className="mb-4"
// 												>
// 													<div
// 														className="mb-2 inline-block rounded-lg px-3 py-1 text-sm font-semibold"
// 														style={{
// 															backgroundColor: COLORS.mint,
// 															color: COLORS.font,
// 														}}
// 													>
// 														{course}
// 													</div>

// 													<div className="grid gap-2">
// 														{subjects.map((subject) => (
// 															<div
// 																key={subject.subjectId}
// 																className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:bg-slate-50"
// 															>
// 																<div>
// 																	<div className="font-medium text-slate-800">
// 																		{subject.subjectId}
// 																	</div>

// 																	<div className="text-sm text-slate-500">
// 																		{subject.subjectName}
// 																	</div>
// 																</div>

// 																<button
// 																	className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600"
// 																	title="De-assign Subject"
// 																	onClick={() =>
// 																		deAssignSubject(
// 																			subject.subjectId,
// 																			data.facultyId,
// 																			course,
// 																			filterYear
// 																		)
// 																	}
// 																>
// 																	<RiDeleteBin6Line size={18} />
// 																</button>
// 															</div>
// 														))}
// 													</div>
// 												</div>
// 											))}
// 										</div>
// 									</details>
// 								</div>
// 							))}
// 						</div>
// 					) :
// 					(
// 						<div className='text-center text-lg'>No data available</div>
// 					)
// 				}
// 			</div>
// 		</div>
// 	) : <Loading />
// }

// export default AssignSubjects











// import React, { useEffect, useState } from 'react'
// import AssignSubjectsHeader from './AssignSubjectsHeader'
// import { RiDeleteBin6Line } from "react-icons/ri";
// import axios from 'axios';
// import { COLORS } from '../../constants/theme';
// import { Loading } from '../index';

// function AssignSubjects() {
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
// 	const [updateData, setUpdateData] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
// 	const currentYear = new Date().getFullYear();

// 	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
// 		(
// 			sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
// 			&& Object.hasOwn(sub.assignments, filterYear)
// 		)
// 	));

// 	useEffect(() => {
// 		const getAssignSubjects = async () => {
// 			try {
// 				const res = await axios.get('/assignSub/');
// 				setAssignedSubjectsData(res.data.data);
// 			} catch (error) {
// 				if (error.status == 409) {
// 					setErrorMsg('Subject already assigned!');
// 				}
// 				else {
// 					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
// 				}
// 			} finally {
// 				setLoading(false);
// 			}
// 		}
// 		getAssignSubjects();
// 	}, [updateData]);

// 	const toggleUpdate = () => {
// 		setUpdateData(prev => !prev);
// 	}

// 	const deAssignSubject = async (subjectId, facultyId, course, academicYear) => {
// 		try {
// 			const res = await axios.delete('/assignSub/', {
// 				data: {
// 					facultyId,
// 					subjectId,
// 					course,
// 					academicYear
// 				}
// 			});
// 			toggleUpdate();
// 			// console.log(res.data.data);
// 		} catch (error) {
// 			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
// 		}
// 	}

// 	return !loading ? (
// 		<div className='h-full flex flex-col'>
// 			<AssignSubjectsHeader
// 				toggleUpdate={toggleUpdate}
// 				setSearchQuery={setSearchQuery}
// 				currentYear={currentYear}
// 				setFilterYear={setFilterYear}
// 			/>
// 			<div className="max-h-125 overflow-y-auto overflow-x-auto px-4 py-1">
// 				{filteredAssignedSubjectsData?.length > 0 ?
// 					(<table className="w-full text-md border border-gray-300">
// 						<thead>
// 							<tr
// 								style={{
// 									backgroundColor: COLORS.mint,
// 									color: COLORS.font
// 								}}
// 							>
// 								<th className="px-2 py-1 text-left font-semibold">
// 									Faculty ID/Name
// 								</th>

// 								<th className="px-2 py-1 text-left font-semibold">
// 									Subjects Assigned
// 								</th>
// 							</tr>
// 						</thead>

// 						<tbody>
// 							{filteredAssignedSubjectsData.map((data) => (
// 								<tr
// 									key={data.facultyId}
// 									className="border-b border-gray-300 hover:bg-gray-50 transition"
// 								>
// 									<td className="w-1/3 px-3 py-3 text-md">
// 										{data.facultyId} - {data.facultyName}
// 										<span
// 											className="ml-2 rounded px-2 py-0.5 text-xs"
// 											style={{ backgroundColor: COLORS.latteDark }}
// 										>
// 											{
// 												Object.values(data.assignments?.[filterYear] || {})
// 													.flat()
// 													.length
// 											} Subjects
// 										</span>
// 									</td>
// 									<td className="px-3 py-3">
// 										{Object.entries(data.assignments).map(([year, courses]) =>
// 											year == filterYear ? (
// 												<details key={year}>
// 													<summary className="cursor-pointer font-semibold">
// 														Assigned Subject List
// 													</summary>

// 													<div className="mt-2 space-y-3">
// 														{Object.entries(courses).map(([course, subjects]) => (
// 															<div key={course}>
// 																<h4
// 																	className="mb-1 rounded px-2 py-1 text-sm font-semibold"
// 																	style={{ backgroundColor: COLORS.latteDark }}
// 																>
// 																	{course}
// 																</h4>

// 																<ul className="space-y-1">
// 																	{subjects.map((subject) => (
// 																		<li
// 																			key={subject.subjectId}
// 																			className="flex items-center justify-between rounded border-b border-gray-300 px-2 py-1 hover:bg-gray-100"
// 																		>
// 																			<span>
// 																				{subject.subjectId} - {subject.subjectName}
// 																			</span>

// 																			<button
// 																				className="cursor-pointer rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-600"
// 																				title="De-assign Subject"
// 																				onClick={() =>
// 																					deAssignSubject(
// 																						subject.subjectId,
// 																						data.facultyId,
// 																						course,
// 																						year
// 																					)
// 																				}
// 																			>
// 																				<RiDeleteBin6Line size={18} />
// 																			</button>
// 																		</li>
// 																	))}
// 																</ul>
// 															</div>
// 														))}
// 													</div>
// 												</details>
// 											) : null
// 										)}
// 									</td>
// 								</tr>
// 							))}
// 						</tbody>
// 					</table>) :
// 					(
// 						<div className='text-center text-lg'>No data available</div>
// 					)
// 				}
// 			</div>
// 		</div>
// 	) : <Loading />
// }

// export default AssignSubjects