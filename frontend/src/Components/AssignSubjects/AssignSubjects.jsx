import React, { useEffect, useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaClipboardList } from "react-icons/fa";
import axios from 'axios';
import { COLORS } from '../../constants/theme';
import { Loading } from '../index';
import DeassignSubject from './DeassignSubject';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');
	const [assignedSubjectsData, setAssignedSubjectsData] = useState([]);
	const [updateData, setUpdateData] = useState(false);
	const [loading, setLoading] = useState(true);
	const [deAssignSubjectData, setDeAssignSubjectData] = useState(null);
	const [filterYear, setFilterYear] = useState(new Date().getFullYear());

	const query = searchQuery.toLowerCase().trim();

	useDocumentTitle('Assign Subjects');

	const filteredAssignedSubjectsData = assignedSubjectsData?.filter((faculty) => {
		const subjectMatch = Object.values(
			faculty.assignments?.[filterYear] || {}
		).some((subjects) =>
			subjects.some(
				(subject) =>
					subject.subjectId.toLowerCase().includes(query) ||
					subject.subjectName.toLowerCase().includes(query)
			)
		);

		return (
			Object.hasOwn(faculty.assignments, filterYear) &&
			(
				faculty.facultyId.toLowerCase().includes(query) ||
				faculty.facultyName.toLowerCase().includes(query) ||
				subjectMatch
			)
		);
	});

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

	const closeDelete = (data) => {
		setDeAssignSubjectData(null);
	}

	return !loading ? (
		<div className="h-full flex flex-col">

			<AssignSubjectsHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
				currentYear={filterYear}
				setFilterYear={setFilterYear}
			/>

			<div className="flex-1 overflow-y-auto">

				{filteredAssignedSubjectsData?.length > 0 ? (
					<div className="grid gap-4 px-3 sm:px-4 py-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

						{filteredAssignedSubjectsData.map((data) => (

							<div
								key={data.facultyId}
								className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
							>

								{/* Faculty Header */}
								<div
									className="px-3 sm:px-4 py-3"
									style={{
										backgroundColor: COLORS.mint,
										color: COLORS.font,
									}}
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

										<div className="min-w-0">
											<h3 className="font-semibold text-base sm:text-lg truncate">
												{data.facultyName}
											</h3>

											<p className="text-xs sm:text-sm opacity-90">
												Faculty ID: {data.facultyId}
											</p>
										</div>


										<div
											className="self-start sm:self-auto rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
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
								<div className="p-3 sm:p-4">

									{Object.keys(data.assignments?.[filterYear] || {}).length > 0 ? (

										Object.entries(
											data.assignments?.[filterYear] || {}
										).map(([course, subjects]) => (

											<div
												key={course}
												className="mb-4 last:mb-0"
											>

												{/* Course Badge */}
												<div className="mb-2 flex items-center justify-between gap-2">

													<span
														className="rounded-md px-2 py-1 text-xs sm:text-sm font-semibold"
														style={{
															backgroundColor: COLORS.latteDark,
														}}
													>
														{course}
													</span>


													<span className="text-xs text-gray-500 whitespace-nowrap">
														{subjects.length} Subject
														{subjects.length > 1 ? "s" : ""}
													</span>

												</div>


												{/* Subject List */}
												<div className="space-y-2">

													{subjects.map((subject) => (

														<div
															key={subject.subjectId}
															className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
														>

															<div className="min-w-0">

																<div className="font-medium text-sm sm:text-base text-slate-800">
																	{subject.subjectId}
																</div>

																<div className="text-xs sm:text-sm text-slate-500 truncate">
																	{subject.subjectName}
																</div>

															</div>


															<button
																className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer shrink-0"
																title="De-assign Subject"
																onClick={() =>
																	setDeAssignSubjectData({
																		subjectId: subject.subjectId,
																		facultyId: data.facultyId,
																		academicYear: filterYear,
																		course,
																	})
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

				) : (

					<div className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 text-slate-500 px-4 text-center">

						<div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-slate-100">
							<FaClipboardList className="text-3xl sm:text-4xl text-slate-400" />
						</div>

						<h2 className="text-lg sm:text-xl font-semibold">
							No Assigned Subjects Found
						</h2>

						<p className="max-w-sm text-xs sm:text-sm">
							Try changing the filters or assign a new subject.
						</p>

					</div>

				)}

			</div>


			{deAssignSubjectData && (
				<DeassignSubject
					data={deAssignSubjectData}
					toggleUpdate={toggleUpdate}
					closeMenu={closeDelete}
				/>
			)}

		</div>

		// <div className='h-full flex flex-col'>
		// 	<AssignSubjectsHeader
		// 		toggleUpdate={toggleUpdate}
		// 		setSearchQuery={setSearchQuery}
		// 		currentYear={filterYear}
		// 		setFilterYear={setFilterYear}
		// 	/>
		// 	<div className="flex-1 overflow-y-auto">
		// 		{filteredAssignedSubjectsData?.length > 0 ?
		// 			(
		// 				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 px-4 py-2">
		// 					{filteredAssignedSubjectsData.map((data) => (
		// 						<div
		// 							key={data.facultyId}
		// 							className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
		// 						>
		// 							{/* Faculty Header */}
		// 							<div
		// 								className="px-4 py-3"
		// 								style={{
		// 									backgroundColor: COLORS.mint,
		// 									color: COLORS.font,
		// 								}}
		// 							>
		// 								<div className="flex items-center justify-between">
		// 									<div>
		// 										<h3 className="font-semibold text-lg">
		// 											{data.facultyName}
		// 										</h3>

		// 										<p className="text-sm opacity-90">
		// 											Faculty ID: {data.facultyId}
		// 										</p>
		// 									</div>

		// 									<div
		// 										className="rounded-full px-3 py-1 text-xs font-medium"
		// 										style={{
		// 											backgroundColor: "rgba(255,255,255,0.2)",
		// 										}}
		// 									>
		// 										{
		// 											Object.values(
		// 												data.assignments?.[filterYear] || {}
		// 											)
		// 												.flat()
		// 												.length
		// 										}{" "}
		// 										Subjects
		// 									</div>
		// 								</div>
		// 							</div>

		// 							{/* Assigned Subjects */}
		// 							<div className="p-4">
		// 								{Object.keys(data.assignments?.[filterYear] || {}).length >
		// 									0 ? (
		// 									Object.entries(
		// 										data.assignments?.[filterYear] || {}
		// 									).map(([course, subjects]) => (
		// 										<div key={course} className="mb-4 last:mb-0">
		// 											{/* Course Badge */}
		// 											<div className="mb-2 flex items-center justify-between">
		// 												<span
		// 													className="rounded-md px-2 py-1 text-sm font-semibold"
		// 													style={{
		// 														backgroundColor:
		// 															COLORS.latteDark,
		// 													}}
		// 												>
		// 													{course}
		// 												</span>

		// 												<span className="text-xs text-gray-500">
		// 													{subjects.length} Subject
		// 													{subjects.length > 1 ? "s" : ""}
		// 												</span>
		// 											</div>

		// 											{/* Subject List */}
		// 											<div className="space-y-2">
		// 												{subjects.map((subject) => (
		// 													<div
		// 														key={subject.subjectId}
		// 														className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
		// 													>
		// 														<div>
		// 															<div className="font-medium text-slate-800">
		// 																{subject.subjectId}
		// 															</div>

		// 															<div className="text-sm text-slate-500">
		// 																{subject.subjectName}
		// 															</div>
		// 														</div>

		// 														<button
		// 															className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
		// 															title="De-assign Subject"
		// 															onClick={() => setDeAssignSubjectData(
		// 																{
		// 																	subjectId: subject.subjectId,
		// 																	facultyId: data.facultyId,
		// 																	academicYear: filterYear,
		// 																	course
		// 																}
		// 															)}
		// 														>
		// 															<RiDeleteBin6Line size={18} />
		// 														</button>
		// 													</div>
		// 												))}
		// 											</div>
		// 										</div>
		// 									))
		// 								) : (
		// 									<div className="py-6 text-center text-sm text-gray-500">
		// 										No subjects assigned for {filterYear}
		// 									</div>
		// 								)}
		// 							</div>
		// 						</div>
		// 					))}
		// 				</div>
		// 			) :
		// 			(
		// 				<div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500">
		// 					<div
		// 						className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"
		// 					>
		// 						<FaClipboardList className="text-4xl text-slate-400" />
		// 					</div>
		// 					<h2 className="text-xl font-semibold">
		// 						No Assigned Subjects Found
		// 					</h2>
		// 					<p className="max-w-sm text-center text-sm">
		// 						Try changing the filters or assign a new subject.
		// 					</p>
		// 				</div>
		// 			)
		// 		}
		// 	</div>
		// 	{deAssignSubjectData && (
		// 		<DeassignSubject
		// 			data={deAssignSubjectData}
		// 			toggleUpdate={toggleUpdate}
		// 			closeMenu={closeDelete}
		// 		/>
		// 	)}
		// </div>
	) : <Loading />
}

export default AssignSubjects