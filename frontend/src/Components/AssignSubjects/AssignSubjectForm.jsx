import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme'
import ErrorSuccessMsg from "../ErrorSuccessMsg";
import Select from 'react-select';

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

	const yearOptions = yearList.map((year) => (
		{
			value: year,
			label: year,
		}
	));

	const facultyOptions = facultyData.map((faculty) => (
		{
			value: faculty.facultyId,
			label: `${faculty.facultyId} - ${faculty.name}`,
		}
	));

	const subjectOptions = filteredSubjects.map((sub) => (
		{
			value: sub.subjectId,
			label: `${sub.subjectId} - ${sub.subjectName}`,
		}
	));

	const handleFaculty = (selected) => {
		setFacultyId(selected);
		setFacultyName((facultyData.find(faculty => faculty.facultyId === selected))?.name || '');
	}

	const handleYear = (selected) => {
		setYear(selected)
		setSubjectId('');
		setSubjectName('');
		setIsDisabled(!selected);
	}

	const handleSubject = (selected) => {
		setSubjectId(selected);
		setSubjectName((filteredSubjects.find(sub => sub.subjectId === selected))?.subjectName || '');
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
		} catch (error) {
			if (error.status == 409) {
				setErrorMsg('Subject already assigned!');
			}
			else {
				console.log('ERROR || AssignSubjectForm | handleAssignSubject(): ', error);
			}
		}
	}

	useEffect(() => {
		setFilteredSubjects(
			subjectData?.filter(sub => (sub.academicYear == year))
		)
	}, [year, subjectData]);

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
					{/* Faculty Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Faculty
						</label>
						<Select
							options={facultyOptions}
							placeholder='Select a faculty'
							value={facultyOptions.find(option => (
								option.value === facultyId
							))}
							onChange={selected => handleFaculty(selected?.value || '')}
							maxMenuHeight={150}
							isClearable
						/>
					</div>

					{/* Year */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Year
						</label>
						<Select
							options={yearOptions}
							placeholder='Select a year'
							value={yearOptions.find(option => (
								option.value === year
							))}
							onChange={selected => handleYear(selected?.value || '')}
							maxMenuHeight={150}
							isClearable
						/>
					</div>

					{/* Subject Name */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Subject Name
						</label>
						<Select
							options={subjectOptions}
							placeholder='Select a subject'
							value={subjectOptions.find(option => (
								option.value === subjectId
							)) || null}
							onChange={selected => handleSubject(selected?.value || '')}
							isDisabled={isDisabled}
							maxMenuHeight={90}
							isClearable
						/>
					</div>

					{/* Buttons */}
					<div className="flex justify-end gap-3 pt-10">
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
