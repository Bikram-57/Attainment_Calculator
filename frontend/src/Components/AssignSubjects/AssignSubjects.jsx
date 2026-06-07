import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { GrEdit } from "react-icons/gr";
import axios from 'axios';
import { COLORS } from '../../constants/theme';

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');
	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
	const [updateData, setUpdateData] = useState(false);

	const filteredAssignedSubjectsData = assignedSubjectsData?.filter(sub => (
		sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase())
	)) || assignedSubjectsData;

	useEffect(() => {
		const getAssignSubjects = async () => {
			try {
				const res = await axios.get('/assignSub/');
				setAssignedSubjectsData(res.data.data);
				console.log(res.data);
			} catch (error) {
				if (error.status == 409) {
					setErrorMsg('Subject already assigned!');
				}
				else {
					console.log('ERROR || AssignSubjectForm | getAssignSubjects(): ', error);
				}
			}
		}

		getAssignSubjects();
	}, [updateData]);

	const toggleUpdate = () => {
		setUpdateData(prev => !prev);
	}

	return (
		<div className='h-full flex flex-col'>
			<AssignSubjectsHeader toggleUpdate={toggleUpdate} setSearchQuery={setSearchQuery} />
			<div className="max-h-125 overflow-y-auto overflow-x-auto border border-gray-200">
				<table className="w-full text-sm">
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

							<th className="px-2 py-1 text-center font-semibold w-35">
								Action
							</th>
						</tr>
					</thead>

					<tbody>


						{filteredAssignedSubjectsData.map((data) => (
							<tr key={data.facultyId}>
								<td>
									{data.facultyId}
								</td>
								<td>
									<details className="rounded border bg-white">
										<summary className="cursor-pointer px-3 py-2">
											Assigned Subjects
										</summary>

										<div className="p-2">
											{Object.entries(data.assignments).map(
												([year, subjects]) => (
													<details key={year} className="mb-2">
														<summary className="font-semibold">
															Academic Year {year}
														</summary>

														<ul className="ml-4 list-disc">
															{subjects.map((subject) => (
																<li key={subject}>{subject}</li>
															))}
														</ul>
													</details>
												)
											)}
										</div>
									</details>
								</td>
								<td className="px-2 py-1">
									<div className="flex items-center justify-center gap-2">
										<button
											className="rounded p-1 transition cursor-pointer"
											style={{
												backgroundColor: COLORS.mint,
												color: COLORS.font
											}}
											// onClick={() => handleEditOpen(subject)}
										>
											<GrEdit />
										</button>
									</div>
								</td>
							</tr>
						))}





						{/* {filteredAssignedSubjectsData.map((faculty) => (
							<tr key={faculty.facultyId}>
								<td>{faculty.facultyName}</td>

								<td>
									<select className="w-full rounded border px-2 py-1">
										{Object.entries(faculty.assignments).map(
											([year, subjects]) => (
												<optgroup key={year} label={`Year ${year}`}>
													{subjects.map((subjectCode) => (
														<option
															key={`${year}-${subjectCode}`}
															value={subjectCode}
														>
															{subjectCode}
														</option>
													))}
												</optgroup>
											)
										)}
									</select>
								</td>
							</tr>
						))} */}





						{/* {
							filteredAssignedSubjectsData.map((faculty) => (
								<tr key={faculty._id}>
									<td>{faculty.facultyName}</td>

									<td>
										{Object.entries(faculty.assignments).map(
											([year, subjects]) => (
												<details
													key={year}
													className="mb-2 rounded border border-gray-200"
												>
													<summary className="cursor-pointer px-3 py-2 bg-gray-50">
														{year}
													</summary>

													<ul className="px-4 py-2">
														{subjects.map((subjectCode) => (
															<li key={subjectCode}>
																{subjectCode}
															</li>
														))}
													</ul>
												</details>
											)
										)}
									</td>
								</tr>
							))
						} */}



						{/* {filteredAssignedSubjectsData?.map((subject, index) => (
							<tr
								key={index}
								className={`border-b border-gray-200 ${index % 2 === 0
									? "bg-[#f1f1f1]"
									: "bg-[#fafafa]"
									}`}
							>
								<td className="px-2 py-1 text-gray-700">
									demo data
								</td>

								<td className="px-2 py-1 text-gray-700">
									demo data
								</td>

								<td className="px-2 py-1">
									<div className="flex items-center justify-center gap-2"> */}
						{/* Edit */}
						{/* <button
											className="rounded p-1 transition cursor-pointer"
											style={{
												backgroundColor: COLORS.mint,
												color: COLORS.font
											}}
											onClick={() => handleEditOpen(subject)}
										>
											<GrEdit />
										</button>
									</div>
								</td>
							</tr>
						))} */}
					</tbody>
				</table>
			</div>
		</div >
	)
}

export default AssignSubjects