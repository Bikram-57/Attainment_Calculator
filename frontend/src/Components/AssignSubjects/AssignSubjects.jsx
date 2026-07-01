import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import { COLORS } from '../../constants/theme';
import { Loading } from '../index';

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
		<div className='h-full flex flex-col'>
			<AssignSubjectsHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
				currentYear={currentYear}
				setFilterYear={setFilterYear}
			/>
			<div className="flex-1 overflow-y-auto">
				{filteredAssignedSubjectsData?.length > 0 ?
					(
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 px-4 py-2">
							{filteredAssignedSubjectsData.map((data) => (
								<div
									key={data.facultyId}
									className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
								>
									{/* Faculty Header */}
									<div
										className="px-4 py-3"
										style={{
											backgroundColor: COLORS.mint,
											color: COLORS.font,
										}}
									>
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-semibold text-lg">
													{data.facultyName}
												</h3>

												<p className="text-sm opacity-90">
													Faculty ID: {data.facultyId}
												</p>
											</div>

											<div
												className="rounded-full px-3 py-1 text-xs font-medium"
												style={{
													backgroundColor: "rgba(255,255,255,0.2)",
												}}
											>
												{
													Object.values(
														data.assignments?.[filterYear] || {}
													)
														.flat()
														.length
												}{" "}
												Subjects
											</div>
										</div>
									</div>

									{/* Assigned Subjects */}
									<div className="p-4">
										{Object.keys(data.assignments?.[filterYear] || {}).length >
											0 ? (
											Object.entries(
												data.assignments?.[filterYear] || {}
											).map(([course, subjects]) => (
												<div key={course} className="mb-4 last:mb-0">
													{/* Course Badge */}
													<div className="mb-2 flex items-center justify-between">
														<span
															className="rounded-md px-2 py-1 text-sm font-semibold"
															style={{
																backgroundColor:
																	COLORS.latteDark,
															}}
														>
															{course}
														</span>

														<span className="text-xs text-gray-500">
															{subjects.length} Subject
															{subjects.length > 1 ? "s" : ""}
														</span>
													</div>

													{/* Subject List */}
													<div className="space-y-2">
														{subjects.map((subject) => (
															<div
																key={subject.subjectId}
																className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
															>
																<div>
																	<div className="font-medium text-slate-800">
																		{subject.subjectId}
																	</div>

																	<div className="text-sm text-slate-500">
																		{subject.subjectName}
																	</div>
																</div>

																<button
																	className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
																	title="De-assign Subject"
																	onClick={() =>
																		deAssignSubject(
																			subject.subjectId,
																			data.facultyId,
																			course,
																			filterYear
																		)
																	}
																>
																	<RiDeleteBin6Line size={18} />
																</button>
															</div>
														))}
													</div>
												</div>
											))
										) : (
											<div className="py-6 text-center text-sm text-gray-500">
												No subjects assigned for {filterYear}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					) :
					(
						<div className='text-center text-lg'>No data available</div>
					)
				}
			</div>
		</div>
	) : <Loading />
}

export default AssignSubjects