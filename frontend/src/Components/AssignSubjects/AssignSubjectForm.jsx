import axios from "axios";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme'

function AssignSubjectForm({ isAssignSubjectOpen, setIsAssignSubjectOpen, toggleUpdate }) {
	const [subjectName, setSubjectName] = useState('');
	const [faculty, setFaculty] = useState('');
	const [year, setYear] = useState('');
	const [isHovered, setIsHovered] = useState(false);
	const d = new Date();

	const handleAddSubject = async () => {
		// try {
		// 	const res = await axios.post('/sub/', {
		// 		subjectId: subjectId,
		// 		subjectName: subjectName,
		// 		course: course,
		// 		academicYear: d.getFullYear()
		// 	});
		// 	setIsAssignSubjectOpen(false);
		// 	toggleUpdate();
		// 	console.log(res.data);
		// } catch (error) {
		// 	console.log('ERROR || handleAddSubject(): ', err);
		// }
	}

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
				<div className="px-6 py-3 space-y-2">

					{/* Subject Code */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Subject Name
						</label>
						{/* <input
							type="text"
							placeholder="E.G. CA1603"
							value={subjectId}
							onChange={(e) => setSubjectId(e.target.value)}
							className="w-full border border-gray-300 rounded-lg px-4 py-1 text-lg outline-none"
						/> */}
						<div className="relative">
							<select
								value={subjectName}
								onChange={(e) => setSubjectName(e.target.value)}
								className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
							>
								<option value="">Select subject from list</option>
								<option value="subject">subject</option>
							</select>

							<FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
						</div>
					</div>

					{/* Subject Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Faculty 
						</label>
						{/* <input
							type="text"
							placeholder="E.g. Software Engineering"
							value={subjectName}
							onChange={(e) => setSubjectName(e.target.value)}
							className="w-full border border-gray-300 rounded-lg px-4 py-1 text-lg outline-none"
						/> */}
						<div className="relative">
							<select
								value={faculty}
								onChange={(e) => setFaculty(e.target.value)}
								className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
							>
								<option value="">Select faculty from list</option>
								<option value="faculty">faculty</option>
							</select>

							<FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
						</div>
					</div>

					{/* Course Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Year
						</label>

						<div className="relative">
							<select
								value={year}
								onChange={(e) => setYear(e.target.value)}
								className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
							>
								<option value="">Select year from list</option>
								<option value="2026">2026</option>
							</select>

							<FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
						</div>
					</div>

					{/* Buttons */}
					<div className="flex justify-end gap-3 pt-2">
						<button
							onClick={() => setIsAssignSubjectOpen(false)}
							className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
							style={{ color: COLORS.font }}
						>
							Close
						</button>

						<button
							className="hover:bg-blue-900 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
							style={{
								color: COLORS.font,
								backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint
							}}
							onClick={handleAddSubject}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							Assign
						</button>
					</div>

					{/* Divider */}
					<div className="border-t border-gray-300 pt-5">
						<p className="text-red-500 text-md">
							Note: Once a subject is created, Subject Code cannot be changed.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AssignSubjectForm