import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { COLORS } from '../../constants/theme'
import ErrorSuccessMsg from "../ErrorSuccessMsg";
import Select from 'react-select';

function AssignSubjectForm({ isAssignSubjectOpen, setIsAssignSubjectOpen, toggleUpdate }) {
	const [facultyData, setFacultyData] = useState('');
	// const [facultyId, setFacultyId] = useState('');
	// const [facultyName, setFacultyName] = useState('');
	const [academicYear, setAcademicYear] = useState('');
	const [subjectData, setSubjectData] = useState('');
	// const [subjectId, setSubjectId] = useState('');
	// const [subjectName, setSubjectName] = useState('');
	const [course, setCourse] = useState('');
	const [isHovered, setIsHovered] = useState(false);
	const [subjectList, setSubjectList] = useState([]);
	const [facultyList, setFacultyList] = useState([]);
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

	const facultyOptions = facultyList.map((faculty) => (
		{
			// value: faculty.facultyId,
			value: faculty,
			label: `${faculty.facultyId} - ${faculty.name}`,
		}
	));

	const courseOptions = [
		{ value: "BCA", label: "BCA" },
		{ value: "MCA", label: "MCA" },
	];

	const subjectOptions = subjectList.map((sub) => (
		{
			// value: sub.subjectId,
			value: sub,
			label: `${sub.subjectId} - ${sub.subjectName}`,
		}
	));

	const handleFaculty = (selected) => {
		setFacultyData(selected);
		// setFacultyId(selected);
		// setFacultyName((facultyData.find(faculty => faculty.facultyId === selected))?.name || '');
	}

	const handleYear = (selected) => {
		setAcademicYear(selected)
		setSubjectData('');
		// setSubjectId('');
		// setSubjectName('');
	}

	const handleCourse = (selectedCourse) => {
		setCourse(selectedCourse);
		setSubjectData('');
		// setSubjectId('');
		// setSubjectName('');
	}

	const handleSubject = (selected) => {
		setSubjectData(selected);
		// setSubjectId(selected);
		// setSubjectName((filteredSubjects.find(sub => sub.subjectId === selected))?.subjectName || '');
	}

	const handleAssignSubject = async () => {
		// if (!facultyName || !year || !subjectName) {
		if (!facultyData || !academicYear || !course || !subjectData) {
			setErrorMsg("Please fill all the fields!");
			return;
		}
		setErrorMsg('');
		try {
			const res = await axios.post('/assignSub/', {
				facultyId: facultyData.facultyId,
				subjectId: subjectData.subjectId,
				subjectName: subjectData.subjectName,
				course,
				academicYear,
				// subjectId: subjectId,
				// subjectName: subjectName,
				// facultyId: facultyId,
				// academicYear: academicYear
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

	const handleDownloadFormat = async () => {
		// try {
		//     const response = await axios.get('/download-format/',
		//         {
		//             responseType: 'blob',
		//         }
		//     );

		//     const blob = new Blob([response.data]);
		//     const url = window.URL.createObjectURL(blob);

		//     const link = document.createElement('a');
		//     link.href = url;
		//     link.download = 'Format.xlsx';

		//     document.body.appendChild(link);
		//     link.click();
		//     link.remove();
		//     window.URL.revokeObjectURL(url);
		// } catch (error) {
		//     console.error('Download failed:', error);
		//     setErrorMsg('Failed to download report.');
		// }
	}

	useEffect(() => {
		const getSubjects = async () => {
			if (!course || !academicYear) {
				setSubjectList([]);
				setIsDisabled(true);
				return;
			}

			try {
				const res = await axios.get(`/sub/year/${academicYear}/course/${course}`);
				console.log(res.data);
				setSubjectList(res.data.data);
				setIsDisabled(false);
				setErrorMsg('');
			} catch (error) {
				console.log('Axios Error | AssignSubjectForm | useEffect() | getSubjects(): ', error);
				setErrorMsg(error?.response?.data?.message);
				setSubjectList([]);
				setIsDisabled(true);
			}
		}

		getSubjects();
	}, [academicYear, course]);

	useEffect(() => {
		const getFaculties = async () => {
			try {
				const res = await axios.get('/user/');
				setFacultyList(res.data.data);
			} catch (error) {
				console.log('Axios Error | AssignSubjectForm | useEffect() | getFaculties(): ', error);
			}
		}

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
								option.value === facultyData.facultyId
							))}
							onChange={selected => handleFaculty(selected?.value || '')}
							maxMenuHeight={150}
							isClearable
						/>
					</div>

					{/* Year */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Academic Year
						</label>
						<Select
							options={yearOptions}
							placeholder='Select a year'
							value={yearOptions.find(option => (
								option.value === academicYear
							))}
							onChange={selected => handleYear(selected?.value || '')}
							maxMenuHeight={150}
							isClearable
						/>
					</div>

					{/* Course */}
					<div>
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Course
						</label>
						<Select
							options={courseOptions}
							placeholder='Select a course'
							value={courseOptions.find(option => (
								option.value === course
							)) || null}
							onChange={selected => handleCourse(selected?.value || '')}
							maxMenuHeight={300}
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
								option.value.subjectId === subjectData?.subjectId
							)) || null}
							onChange={selected => handleSubject(selected?.value || '')}
							isDisabled={isDisabled}
							maxMenuHeight={90}
							isClearable
						/>
					</div>

					{/* Buttons */}
					<div className="flex justify-between gap-3 pt-10">
						<button
							className='text-md border rounded-md px-2 font-semibold cursor-pointer'
							onClick={handleDownloadFormat}
							style={{ backgroundColor: COLORS.latteDark }}
						>
							Download Format
						</button>
						<div className="flex items-center gap-3">
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
