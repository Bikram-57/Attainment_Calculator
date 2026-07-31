import React, { useEffect, useState } from 'react'
import FacultyHeader from './FacultyHeader'
import axios from 'axios'
import { ActionBtns, FacultyDeleteModal, FacultyEditModal, FacultyViewModal, Loading } from '../index';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function Faculty() {
	const [facultyData, setFacultyData] = useState([]);
	const [toggleNewUser, setToggleNewUser] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);

	useDocumentTitle('Manage Faculty');

	const getFacultyData = async () => {
		try {
			const response = await axios.get('/user/');
			setFacultyData(response.data.data);
		} catch (error) {
			console.log('Axios Error | Faculty | getFacultyData(): ', error);
		} finally {
			setLoading(false);
		}
	}

	const toggleUpdate = () => setToggleNewUser(prev => !prev);

	const filteredFaculty = facultyData.filter(sub => (
		sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase().trim())
		|| sub.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
	));

	useEffect(() => {
		getFacultyData();
	}, [toggleNewUser]);
	return !loading ? (
		<div className="h-full flex flex-col bg-slate-50">

			<FacultyHeader
				toggleUpdate={toggleUpdate}
				setSearchQuery={setSearchQuery}
			/>


			<div className="flex-1 overflow-hidden p-2 sm:p-3">

				<div className="h-full rounded-xl sm:rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">

					{filteredFaculty.length ? (

						<div className="h-full overflow-auto">

							<table className="min-w-175 w-full border-collapse">

								<thead className="sticky top-0 bg-slate-100 z-2">

									<tr className="text-xs sm:text-sm uppercase tracking-wide text-slate-600">

										<th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
											Faculty ID
										</th>

										<th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
											Faculty Name
										</th>

										<th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
											Email Address
										</th>

										<th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
											Actions
										</th>

									</tr>

								</thead>


								<tbody>

									{filteredFaculty.map(faculty => (

										<tr
											key={faculty._id}
											className="border-b border-slate-100 even:bg-slate-50 hover:bg-blue-50 transition-all duration-200"
										>

											<td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base text-slate-800">
												{faculty.facultyId}
											</td>


											<td className="px-3 sm:px-6 py-3 sm:py-4">

												<div className="font-semibold text-sm sm:text-base text-slate-800">
													{faculty.name}
												</div>

											</td>


											<td className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-slate-600">
												{faculty.email}
											</td>


											<td className="px-3 sm:px-6 py-3 sm:py-4">

												<div className="flex justify-center">

													<ActionBtns
														data={faculty}
														toggleUpdate={toggleUpdate}
														ViewModal={FacultyViewModal}
														EditModal={FacultyEditModal}
														DeleteModal={FacultyDeleteModal}
													/>

												</div>

											</td>


										</tr>

									))}

								</tbody>

							</table>

						</div>


					) : (

						<div className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 text-slate-500 px-4 text-center">

							<div className="text-5xl sm:text-6xl">
								👨‍🏫
							</div>


							<h2 className="text-lg sm:text-xl font-semibold">
								No Faculty Found
							</h2>


							<p className="text-xs sm:text-sm">
								Try changing your search criteria.
							</p>


						</div>

					)}

				</div>

			</div>

		</div>

		// <div className="h-full flex flex-col bg-slate-50">
		// 	<FacultyHeader
		// 		toggleUpdate={toggleUpdate}
		// 		setSearchQuery={setSearchQuery}
		// 	/>

		// 	<div className="flex-1 overflow-hidden p-3">

		// 		<div className="h-full rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">

		// 			{filteredFaculty.length ? (

		// 				<div className="h-full overflow-auto">

		// 					<table className="w-full border-collapse">

		// 						<thead className="sticky top-0 bg-slate-100 z-2">
		// 							<tr className="text-sm uppercase tracking-wide text-slate-600">

		// 								<th className="px-6 py-4 text-left">
		// 									Faculty ID
		// 								</th>

		// 								<th className="px-6 py-4 text-left">
		// 									Faculty Name
		// 								</th>

		// 								<th className="px-6 py-4 text-left">
		// 									Email Address
		// 								</th>

		// 								<th className="px-6 py-4 text-center">
		// 									Actions
		// 								</th>

		// 							</tr>
		// 						</thead>

		// 						<tbody>

		// 							{filteredFaculty.map(faculty => (

		// 								<tr
		// 									key={faculty._id}
		// 									className="border-b border-slate-100 even:bg-slate-50 hover:bg-blue-50 transition-all duration-200"
		// 								>

		// 									<td className="px-6 py-4 font-medium text-slate-800">
		// 										{faculty.facultyId}
		// 									</td>

		// 									<td className="px-6 py-4">
		// 										<div className="font-semibold text-slate-800">
		// 											{faculty.name}
		// 										</div>
		// 									</td>

		// 									<td className="px-6 py-4 text-slate-600">
		// 										{faculty.email}
		// 									</td>

		// 									<td className="px-6 py-4">

		// 										<div className="flex justify-center">
		// 											<ActionBtns
		// 												data={faculty}
		// 												toggleUpdate={toggleUpdate}
		// 												ViewModal={FacultyViewModal}
		// 												EditModal={FacultyEditModal}
		// 												DeleteModal={FacultyDeleteModal}
		// 											/>
		// 										</div>

		// 									</td>

		// 								</tr>

		// 							))}

		// 						</tbody>

		// 					</table>

		// 				</div>

		// 			) : (

		// 				<div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500">

		// 					<div className="text-6xl">
		// 						👨‍🏫
		// 					</div>

		// 					<h2 className="text-xl font-semibold">
		// 						No Faculty Found
		// 					</h2>

		// 					<p className="text-sm">
		// 						Try changing your search criteria.
		// 					</p>

		// 				</div>

		// 			)}

		// 		</div>

		// 	</div>

		// </div>

		// <div className='h-full flex flex-col'>
		// 	<FacultyHeader toggleUpdate={toggleUpdate} setSearchQuery={setSearchQuery} />
		// 	<div className='flex-1 overflow-y-auto'>
		// 		{filteredFaculty?.length > 0 ? (
		// 			<table className='w-full'>
		// 				<thead>
		// 					<tr className='text-left border-b border-gray-300'>
		// 						<th className='px-5 py-2 w-[15%]'>Faculty ID</th>
		// 						<th className='px-5 py-2 w-[35%]'>Name</th>
		// 						<th className='px-5 py-2 w-[35%]'>Email</th>
		// 						<th className='px-5 py-2 text-center w-[15%]'>Action</th>
		// 					</tr>
		// 				</thead>
		// 				<tbody>
		// 					{filteredFaculty.map(faculty => (
		// 						<tr className='text-left border-b border-gray-300' key={faculty._id}>
		// 							<td className='px-5 py-2 w-[15%]'>{faculty.facultyId}</td>
		// 							<td className='px-5 py-2 w-[35%]'>{faculty.name}</td>
		// 							<td className='px-5 py-2 w-[35%]'>{faculty.email}</td>
		// 							<td className='px-5 py-2 flex items-center justify-center'>
		// 								<ActionBtns
		// 									data={faculty}
		// 									toggleUpdate={toggleUpdate}
		// 									ViewModal={FacultyViewModal}
		// 									EditModal={FacultyEditModal}
		// 									DeleteModal={FacultyDeleteModal}
		// 								/>
		// 							</td>
		// 						</tr>
		// 					))}
		// 				</tbody>
		// 			</table>
		// 		) :
		// 			(
		// 				<div className='text-center text-lg'>No data available</div>
		// 			)
		// 		}
		// 	</div>
		// </div>
	) : (
		<Loading />
	)
}

export default Faculty