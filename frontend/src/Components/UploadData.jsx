import React, { useState } from 'react'

function UploadData() {
	const [isDisabled, setIsDisabled] = useState(true);
	const [year, setYear] = useState('')

	const handleYearChange = (e) => {
		setYear(e.target.value);
		year !== '' ? setIsDisabled(true) : setIsDisabled(false);
	}

	return (
		<div className='h-full flex flex-col'>
			<div className='flex justify-between p-4'>
				<div className='text-blue-900 text-xl font-semibold'>Upload Data</div>
			</div>
			<div className='px-4 w-full flex gap-4'>
				<select
					className='border border-gray-300 rounded-sm flex-1'
					value={year}
					onChange={handleYearChange}
				>
					<option value=''>Select a year</option>
					<option value='value 1'>value 1</option>
					<option value='value 2'>value 2</option>
					<option value='value 3'>value 3</option>
				</select>
				<select className='border border-gray-300 rounded-sm flex-1'>
					<option value=''>Select a course</option>
					<option value='value 1'>value 1</option>
					<option value='value 2'>value 2</option>
					<option value='value 3'>value 3</option>
				</select>
				<select
					className={`${isDisabled ? 'bg-gray-50 text-gray-400' : null} border border-gray-300 rounded-sm flex-1`}
					disabled={isDisabled}
				>
					<option value=''>Select a subject</option>
					<option value='value 1'>value 1</option>
					<option value='value 2'>value 2</option>
					<option value='value 3'>value 3</option>
				</select>
			</div>
			
		</div>
	)
}

export default UploadData