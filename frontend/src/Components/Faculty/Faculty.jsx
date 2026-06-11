import React, { useEffect, useState } from 'react'
import FacultyHeader from './FacultyHeader'
import axios from 'axios'
import { ActionBtns, FacultyDeleteModal, FacultyEditModal, FacultyViewModal, Loading } from '../index';

function Faculty() {
	const [facultyData, setFacultyData] = useState([]);
	const [toggleNewUser, setToggleNewUser] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);

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
		sub.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) || sub.name.toLowerCase().includes(searchQuery.toLowerCase())
	)) || facultyData;

	useEffect(() => {
		getFacultyData();
	}, [toggleNewUser]);
	return !loading ? (
		<div className='h-full flex flex-col'>
			<FacultyHeader toggleUpdate={toggleUpdate} setSearchQuery={setSearchQuery} />
			<div className='flex-1 overflow-y-auto'>
				{filteredFaculty?.length > 0 ? (
					<table className='w-full'>
						<thead>
							<tr className='text-left border-b border-gray-300'>
								<th className='px-5 py-2 w-[15%]'>Faculty ID</th>
								<th className='px-5 py-2 w-[35%]'>Name</th>
								<th className='px-5 py-2 w-[35%]'>Email</th>
								<th className='px-5 py-2 text-center w-[15%]'>Action</th>
							</tr>
						</thead>
						<tbody>
							{filteredFaculty.map(faculty => (
								<tr className='text-left border-b border-gray-300' key={faculty._id}>
									<td className='px-5 py-2 w-[15%]'>{faculty.facultyId}</td>
									<td className='px-5 py-2 w-[35%]'>{faculty.name}</td>
									<td className='px-5 py-2 w-[35%]'>{faculty.email}</td>
									<td className='px-5 py-2 flex items-center justify-center'>
										<ActionBtns
											data={faculty}
											toggleUpdate={toggleUpdate}
											ViewModal={FacultyViewModal}
											EditModal={FacultyEditModal}
											DeleteModal={FacultyDeleteModal}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) :
					(
						<div className='text-center text-lg'>No data available</div>
					)
				}
			</div>
		</div>
	) : (
		<Loading />
	)
}

export default Faculty