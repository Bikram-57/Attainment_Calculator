import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { COLORS } from '../../constants/theme';

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');
	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
	const [updateData, setUpdateData] = useState(false);
	const [filterYear, setFilterYear] = useState(new Date().getFullYear());
	const currentYear = new Date().getFullYear();

	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
		(sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) && Object.hasOwn(sub.assignments, filterYear))
	)) || assignedSubjectsData;

	useEffect(() => {
		const getAssignSubjects = async () => {
			try {
				const res = await axios.get('/assignSub/');
				setAssignedSubjectsData(res.data.data);
				console.log(res.data.data);
			} catch (error) {
				if (error.status == 409) {
					setErrorMsg('Subject already assigned!');
				}
				else {
					console.log('ERROR || AssignSubject | getAssignSubjects(): ', error);
				}
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

	return (
		<div className='h-full flex flex-col'>
			<AssignSubjectsHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
				currentYear={currentYear}
				setFilterYear={setFilterYear}
			/>
			<div className="max-h-125 overflow-y-auto overflow-x-auto border border-gray-200">
				{filteredAssignedSubjectsData.length > 0 ?
					(<table className="w-full text-sm">
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
									className="border-b hover:bg-gray-50 transition"
								>
									<td className="w-1/3 px-3 py-3 font-medium">
										{data.facultyId} - {data.facultyName}
									</td>

									<td className="px-3 py-3">
										{Object.entries(data.assignments).map(([year, subjects]) =>
											year == filterYear ? (
												<div key={year}>
													<div className="mb-2 text-sm font-semibold text-gray-600">
														Academic Year {year}
														<span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs">
															{subjects.length} Subjects
														</span>
													</div>

													<ul className="space-y-1">
														{subjects.map((subject) => (
															<li
																key={subject.subjectId}
																className="flex items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
															>
																<span>{subject.subjectName}</span>

																<button
																	className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
																	title="De-assign Subject"
																	onClick={() => deAssignSubject(subject.subjectId, data.facultyId, year)}
																>
																	<MdDelete size={18} />
																</button>
															</li>
														))}
													</ul>
												</div>
											) : null
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					) :
					(
						<div className='text-center text-lg'>No data available for the year: {filterYear}</div>
					)
				}
			</div>
		</div >
	)
}

export default AssignSubjects