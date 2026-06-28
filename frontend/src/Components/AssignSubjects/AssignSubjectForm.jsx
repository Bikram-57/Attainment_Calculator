import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { COLORS } from '../../constants/theme'
import Select from 'react-select';
import AssignSingleSubjectForm from "./AssignSingleSubjectForm";
import AssignMultipleSubjectForm from "./AssignMultipleSubjectForm";

function AssignSubjectForm({ isAssignSubjectOpen, setIsAssignSubjectOpen, toggleUpdate }) {
	const [assignSingleSubject, setAssignSingleSubject] = useState(true);

	const subjectAssignOptions = [
		{ value: true, label: 'Single subject' },
		{ value: false, label: 'Multiple subjects' }
	];

	if (!isAssignSubjectOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div
				className="w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
				style={{ backgroundColor: COLORS.latte }}
			>
				{/* Header */}
				<div
					className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
					style={{ backgroundColor: COLORS.mint }}
				>
					<h2
						className="text-xl font-semibold"
						style={{ color: COLORS.font }}
					>
						Assign Subject
					</h2>

					<button
						onClick={() => setIsAssignSubjectOpen(false)}
						className="cursor-pointer"
					>
						<IoMdClose className='w-6 h-6' style={{ color: COLORS.font }} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-4 space-y-2">
					<div>
						<label className="block text-md text-gray-700 mb-1 font-semibold">
							Subjects to assign
						</label>

						<Select
							options={subjectAssignOptions}
							placeholder='Select a year'
							value={subjectAssignOptions.find(option => (
								option.value === assignSingleSubject
							))}
							onChange={selected => setAssignSingleSubject(selected?.value)}
							maxMenuHeight={100}
						/>
					</div>

					{assignSingleSubject &&
						<AssignSingleSubjectForm
							isAssignSubjectOpen={isAssignSubjectOpen}
							setIsAssignSubjectOpen={setIsAssignSubjectOpen}
							toggleUpdate={toggleUpdate}
						/>
					}

					{!assignSingleSubject &&
						<AssignMultipleSubjectForm
							isAssignSubjectOpen={isAssignSubjectOpen}
							setIsAssignSubjectOpen={setIsAssignSubjectOpen}
							toggleUpdate={toggleUpdate}
						/>
					}
				</div>
			</div>
		</div>
	);
}

export default AssignSubjectForm
