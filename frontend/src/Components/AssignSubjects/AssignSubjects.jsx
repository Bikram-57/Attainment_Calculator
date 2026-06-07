import React, { useState } from 'react'
import AssignSubjectsHeader from './AssignSubjectsHeader'

function AssignSubjects() {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className='h-full flex flex-col'>
			<AssignSubjectsHeader />
		</div>
	)
}

export default AssignSubjects