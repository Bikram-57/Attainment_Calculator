// import { useState } from 'react';
// import Select from 'react-select';
// import { FaFilter } from 'react-icons/fa';

// function HeaderFilters({
//     showYear = false,
//     showSemester = false,
//     showCourse = false,

//     academicYear = '',
//     semester = '',
//     course = '',

//     onYearChange,
//     onSemesterChange,
//     onCourseChange,

//     isClearable = true
// }) {
//     const [isOpen, setIsOpen] = useState(false);

//     const yearOptions = [
//         { value: '2024', label: '2024' },
//         { value: '2025', label: '2025' },
//         { value: '2026', label: '2026' },
//     ];

//     const semesterOptions = [
//         { value: '1', label: 'Semester 1' },
//         { value: '2', label: 'Semester 2' },
//         { value: '3', label: 'Semester 3' },
//         { value: '4', label: 'Semester 4' },
//         { value: '5', label: 'Semester 5' },
//         { value: '6', label: 'Semester 6' },
//         { value: '7', label: 'Semester 7' },
//         { value: '8', label: 'Semester 8' },
//     ];

//     const courseOptions = [
//         { value: 'BCA', label: 'BCA' },
//         { value: 'MCA', label: 'MCA' },
//     ];

//     const activeFilters = [
//         academicYear,
//         semester,
//         course,
//     ].filter(Boolean).length;

//     const clearFilters = () => {
//         onYearChange?.('');
//         onSemesterChange?.('');
//         onCourseChange?.('');
//     };

//     return (
//         <div className="relative">
//             {/* Filter Button */}
//             <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
//             >
//                 <FaFilter />

//                 <span>Filters</span>

//                 {activeFilters > 0 && (
//                     <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
//                         {activeFilters}
//                     </span>
//                 )}
//             </button>

//             {/* Dropdown */}
//             {isOpen && (
//                 <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border bg-white p-4 shadow-xl">
//                     <h3 className="mb-4 text-lg font-semibold">
//                         Filters
//                     </h3>

//                     <div className="space-y-3">
//                         {showYear && (
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium">
//                                     Academic Year
//                                 </label>

//                                 <Select
//                                     placeholder="Select year"
//                                     options={yearOptions}
//                                     value={yearOptions.find(
//                                         y => y.value === academicYear
//                                     )}
//                                     onChange={(selected) =>
//                                         onYearChange?.(selected?.value || '')
//                                     }
//                                     isClearable={isClearable}
//                                 />
//                             </div>
//                         )}

//                         {showCourse && (
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium">
//                                     Course
//                                 </label>

//                                 <Select
//                                     placeholder="Select course"
//                                     options={courseOptions}
//                                     value={courseOptions.find(
//                                         c => c.value === course
//                                     )}
//                                     onChange={(selected) =>
//                                         onCourseChange?.(selected?.value || '')
//                                     }
//                                     isClearable={isClearable}
//                                 />
//                             </div>
//                         )}

//                         {showSemester && (
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium">
//                                     Semester
//                                 </label>

//                                 <Select
//                                     placeholder="Select semester"
//                                     options={semesterOptions}
//                                     value={semesterOptions.find(
//                                         s => s.value === semester
//                                     )}
//                                     onChange={(selected) =>
//                                         onSemesterChange?.(selected?.value || '')
//                                     }
//                                     isClearable={isClearable}
//                                 />
//                             </div>
//                         )}
//                     </div>

//                     <div className="mt-4 flex justify-end gap-2">
//                         <button
//                             onClick={clearFilters}
//                             className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
//                         >
//                             Clear
//                         </button>

//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
//                         >
//                             Apply
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default HeaderFilters;



import { useState } from 'react';
import Select from 'react-select';

function Filters({
    showYear = false,
    showSemester = false,
    showCourse = false,

    defaultYear = '',
    defaultSemester = '',
    defaultCourse = '',

    onYearChange,
    onSemesterChange,
    onCourseChange,

    isYearClearable = true,
    isSemesterClearable = true,
    isCourseClearable = true,
}) {
    const [academicYear, setAcademicYear] = useState(defaultYear);
    const [semester, setSemester] = useState(defaultSemester);
    const [course, setCourse] = useState(defaultCourse);
    
    const yearOptions = [
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
    ];

    const semesterOptions = [
        { value: '1', label: 'Sem 1' },
        { value: '2', label: 'Sem 2' },
        { value: '3', label: 'Sem 3' },
        { value: '4', label: 'Sem 4' },
        { value: '5', label: 'Sem 5' },
        { value: '6', label: 'Sem 6' },
        { value: '7', label: 'Sem 7' },
        { value: '8', label: 'Sem 8' },
    ];

    const courseOptions = [
        { value: 'BCA', label: 'BCA' },
        { value: 'MCA', label: 'MCA' },
    ];

    const handleYearChange = (selected) => {
        setAcademicYear(selected);
        onYearChange?.(selected);
    }
    const handleSemesterChange = (selected) => {
        setSemester(selected);
        onSemesterChange?.(selected);
    }
    const handleCourseChange = (selected) => {
        setCourse(selected);
        onCourseChange?.(selected);
    }
    
    return (
        <div className="flex flex-wrap items-center gap-2 z-10">
            {showYear && (
                <div className="w-33">
                    <Select
                        placeholder="Year"
                        options={yearOptions}
                        value={yearOptions.find(
                            option => option.value === academicYear
                        )}
                        onChange={(selected) =>
                            handleYearChange(selected?.value || '')
                        }
                        isClearable={isYearClearable}
                    />
                </div>
            )}

            {showSemester && (
                <div className="w-40">
                    <Select
                        placeholder="Semester"
                        options={semesterOptions}
                        value={semesterOptions.find(
                            option => option.value === semester
                        )}
                        onChange={(selected) =>
                            handleSemesterChange(selected?.value || '')
                        }
                        isClearable={isSemesterClearable}
                    />
                </div>
            )}

            {showCourse && (
                <div className="w-33">
                    <Select
                        placeholder="Course"
                        options={courseOptions}
                        value={courseOptions.find(
                            option => option.value === course
                        )}
                        onChange={(selected) =>
                            handleCourseChange(selected?.value || '')
                        }
                        isClearable={isCourseClearable}
                    />
                </div>
            )}
        </div>
    );
}

export default Filters;
