import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme'
import ErrorSuccessMsg from "../ErrorSuccessMsg";

function AssignSubjectForm({ isAssignSubjectOpen, setIsAssignSubjectOpen, toggleUpdate }) {
	const [facultyId, setFacultyId] = useState('');
	const [facultyName, setFacultyName] = useState('');
	const [year, setYear] = useState('');
	const [subjectId, setSubjectId] = useState('');
	const [subjectName, setSubjectName] = useState('');
	const [isHovered, setIsHovered] = useState(false);
	const [subjectData, setSubjectData] = useState([]);
	const [facultyData, setFacultyData] = useState([]);
	const [filteredSubjects, setFilteredSubjects] = useState([]);
	const [isDisabled, setIsDisabled] = useState(true);
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	// const d = new Date();
	const yearList = [2024, 2025, 2026];

	useEffect(() => {
		setFilteredSubjects(
			subjectData?.filter(sub => (sub.academicYear == year))
		)
	}, [year]);

	useEffect(() => {
		const getSubjects = async () => {
			try {
				const response = await axios.get('/sub/');
				setSubjectData(response.data.data);
			} catch (error) {
				console.log('Axios Error | AssignSubjectForm | useEffect() | getSubjects(): ', error);
			}
		}
		const getFaculties = async () => {
			try {
				const response = await axios.get('/user/');
				setFacultyData(response.data.data);
			} catch (error) {
				console.log('Axios Error | AssignSubjectForm | useEffect() | getFacultyData(): ', error);
			}
		}

		getSubjects();
		getFaculties();
	}, []);

	const handleFaculty = (e) => {
		setFacultyId(e.target.value);
		setFacultyName((facultyData.find(faculty => faculty.facultyId === e.target.value)).name);
	}

	const handleYear = (e) => {
		setYear(e.target.value)
		setIsDisabled(false);
	}

	const handleSubject = (e) => {
		setSubjectId(e.target.value);
		setSubjectName((filteredSubjects.find(sub => sub.subjectId === e.target.value)).subjectName);
	}

	const handleAssignSubject = async () => {
		if (facultyName.length === 0 || year.length === 0 || subjectName.length === 0) {
			setErrorMsg("Please fill all the fields!");
			return;
		}
		setErrorMsg('');
		try {
			const res = await axios.post('/assignSub/', {
				subjectId: subjectId,
				subjectName: subjectName,
				facultyId: facultyId,
				academicYear: year
			});
			setSuccessMsg('Subject successfully assigned!');
			toggleUpdate();
			console.log(res.data);
		} catch (error) {
			if (error.status == 409) {
				setErrorMsg('Subject already assigned!');
			}
			else {
				console.log('ERROR || AssignSubjectForm | handleAssignSubject(): ', error);
			}
		}
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

					{/* Faculty Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Faculty
						</label>
						<div className="relative">
							<select
								value={facultyId}
								onChange={(e) => handleFaculty(e)}
								className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
							>
								<option value="">Select faculty from list</option>
								{facultyData.map(faculty => (
									<option key={faculty.facultyId} value={faculty.facultyId}>
										{faculty.name} - {faculty.facultyId}
									</option>
								))}
							</select>

							<FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
						</div>
					</div>

					{/* Year */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Year
						</label>

						<div className="relative">
							<select
								value={year}
								onChange={(e) => handleYear(e)}
								className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg cursor-pointer outline-none"
							// disabled={subjectData.length > 0 ? false : true}
							>
								<option value="">Select year from list</option>
								{yearList.map(y => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>

							<FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
						</div>
					</div>

					{/* Subject Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Subject Name
						</label>
						<div className="relative">
							<select
								value={subjectId}
								onChange={(e) => handleSubject(e)}
								className={`${isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'} w-full appearance-none border border-gray-300 rounded-lg px-4 py-1 text-lg outline-none`}
								style={{ backgroundColor: isDisabled ? COLORS.latteDark : COLORS.font }}
								disabled={isDisabled}
							>
								<option value="">Select subject from list</option>
								{filteredSubjects?.map(sub => (
									<option key={sub.subjectId} value={sub.subjectId}>
										{sub.subjectName}
									</option>
								))}
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
							onClick={handleAssignSubject}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							Assign
						</button>
					</div>
					<ErrorSuccessMsg
						errorMsg={errorMsg}
						successMsg={successMsg}
						setSuccessMsg={setSuccessMsg}
						setIsOpen={setIsAssignSubjectOpen}
					/>
				</div>
			</div>
		</div>
	);
}

export default AssignSubjectForm