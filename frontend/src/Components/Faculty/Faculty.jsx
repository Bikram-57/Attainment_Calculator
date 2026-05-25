import React, { useEffect, useState } from 'react'
import FacultyHeader from './FacultyHeader'
import axios from 'axios'
import { ActionBtns } from '../index';

function Faculty() {
	const [facultyData, setFacultyData] = useState([]);
	const [toggleNewUser, setToggleNewUser] = useState(false);

	const getFacultyData = async () => {
		try {
			const response = await axios.get('/user/');
			setFacultyData(response.data.data);
		} catch (error) {
			console.log('Axios Error | getFacultyData(): ', error);
		}
	}

	useEffect(() => {
		getFacultyData();
	}, [toggleNewUser]);
	return (
		<div className=''>
			<FacultyHeader setToggleNewUser={setToggleNewUser} />
			<div>
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
						{facultyData.map(faculty => (
							<tr className='text-left border-b border-gray-300' key={faculty._id}>
								<td className='px-5 py-2 w-[15%]'>{faculty.facultyId}</td>
								<td className='px-5 py-2 w-[35%]'>{faculty.name}</td>
								<td className='px-5 py-2 w-[35%]'>{faculty.email}</td>
								<td className='px-5 py-2 flex items-center justify-center'>
									{/* <SlOptions className='cursor-pointer'/> */}
									<ActionBtns
										setToggleNewUser={setToggleNewUser}
										facultyId={faculty.facultyId}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default Faculty