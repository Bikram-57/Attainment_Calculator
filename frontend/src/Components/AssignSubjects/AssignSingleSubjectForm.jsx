import React, { useEffect, useState } from "react";
import axios from "axios";
import { COLORS } from '../../constants/theme'
import { ErrorSuccessMsg } from "../index";
import Select from 'react-select';

function AssignSingleSubjectForm({ isAssignSubjectOpen, setIsAssignSubjectOpen, toggleUpdate }) {
    const [facultyData, setFacultyData] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [subjectData, setSubjectData] = useState('');
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
            value: sub,
            label: `${sub.subjectId} - ${sub.subjectName}`,
        }
    ));

    const handleFaculty = (selected) => {
        setFacultyData(selected);
    }

    const handleYear = (selected) => {
        setAcademicYear(selected)
        setSubjectData('');
    }

    const handleCourse = (selectedCourse) => {
        setCourse(selectedCourse);
        setSubjectData('');
    }

    const handleSubject = (selected) => {
        setSubjectData(selected);
    }

    const handleAssignSubject = async () => {
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
        <div>
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
    )
}

export default AssignSingleSubjectForm