import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import { COLORS } from '../../constants/theme';
import Loading from '../Loading';
import { useSelector } from 'react-redux';

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');
	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
	const [updateData, setUpdateData] = useState(false);
	const [loading, setLoading] = useState(true);
	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
	const currentYear = new Date().getFullYear();
	const token = useSelector(state => state.auth.accessToken);

	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
		(sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) && Object.hasOwn(sub.assignments, filterYear))
	)) || assignedSubjectsData;

	useEffect(() => {
		const getAssignSubjects = async () => {
			try {
				const res = await axios.get('/assignSub/', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				setAssignedSubjectsData(res.data.data);
				console.log(res.data.data);
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

	const deAssignSubject = async (subjectId, facultyId, academicYear) => {
		console.log(subjectId, typeof (subjectId), facultyId, typeof (facultyId), academicYear, typeof (academicYear));

		try {
			const res = await axios.delete('/assignSub/', {
				data: {
					subjectId: subjectId,
					facultyId: facultyId,
					academicYear: academicYear
				}
			});
			toggleUpdate();
			console.log(res.data.data);
		} catch (error) {
			console.log('ERROR || AssignSubject | deAssignSubject(): ', error);
		}
	}

	return !loading ? (
		<div className='h-full flex flex-col'>
			<AssignSubjectsHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
				currentYear={currentYear}
				setFilterYear={setFilterYear}
			/>
			<div className="max-h-125 overflow-y-auto overflow-x-auto px-4 py-1">
				{filteredAssignedSubjectsData?.length > 0 ?
					(<table className="w-full text-md border border-gray-300">
						<thead>
							<tr
								style={{
									backgroundColor: COLORS.mint,
									color: COLORS.font
								}}
							>
								<th className="px-2 py-1 text-left font-semibold">
									Faculty ID/Name
								</th>

								<th className="px-2 py-1 text-left font-semibold">
									Subjects Assigned
								</th>
							</tr>
						</thead>

						<tbody>
							{filteredAssignedSubjectsData.map((data) => (
								<tr
									key={data.facultyId}
									className="border-b border-gray-300 hover:bg-gray-50 transition"
								>
									<td className="w-1/3 px-3 py-3 text-md">
										{data.facultyId} - {data.facultyName}
										<span
											className='ml-2 rounded px-2 py-0.5 text-xs'
											style={{ backgroundColor: COLORS.latteDark }}
										>
											{(data.assignments[filterYear] || []).length} Subjects
										</span>
									</td>

									<td className="px-3 py-3">
										{Object.entries(data.assignments).map(([year, subjects]) =>
											year == filterYear ? (
												<details key={year}>
													<summary className='cursor-pointer font-semibold'>
														Assigned Subject List
													</summary>

													<ul className="space-y-1">
														{subjects.map((subject) => (
															<li
																key={subject.subjectId}
																className="flex items-center justify-between border-b border-gray-300 rounded px-2 py-1 hover:bg-gray-100"
															>
																<span>{subject.subjectName}</span>

																<button
																	className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
																	title="De-assign Subject"
																	onClick={() => deAssignSubject(subject.subjectId, data.facultyId, year)}
																>
																	<RiDeleteBin6Line size={18} />
																</button>
															</li>
														))}
													</ul>
												</details>
											) : null
										)}
									</td>

									{/* <td>
										<div className="p-2">
											{Object.entries(data.assignments).map(([year, subjects]) =>
												year == filterYear ? (
													subjects.length > 0 ? (
														<details key={year} className="mb-2">
															<summary className="font-semibold cursor-pointer">
																{subjects[0].subjectName}
															</summary>

															<ul className="mt-2 ml-4 list-disc">
																{subjects.slice(1).map((subject) => (
																	<li
																		key={subject.subjectId}
																		className="flex items-center justify-between"
																	>
																		<span>{subject.subjectName}</span>

																		<button
																			className="rounded p-1 transition cursor-pointer"
																			style={{
																				color: COLORS.mint
																			}}
																		>
																			<MdDelete />
																		</button>
																	</li>
																))}
															</ul>
														</details>
													) : (
														<span key={year}>No subjects assigned</span>
													)
												) : null
											)}
										</div>
									</td> */}


								</tr>
							))}
						</tbody>
					</table>) :
					(
						<div className='text-center text-lg'>No data available</div>
					)
				}
			</div>
		</div>
	) : <Loading />
}

export default AssignSubjects