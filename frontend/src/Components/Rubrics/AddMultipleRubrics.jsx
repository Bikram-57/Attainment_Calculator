import React, { useRef, useState } from 'react'
import { COLORS } from '../../constants/theme'
import { MdOutlineCancelPresentation } from "react-icons/md";
import ErrorSuccessMsg from '../../utils/ErrorSuccessMsg'
import Select from 'react-select';
import axios from 'axios';

function AddMultipleRubrics({ setIsUploadOpen, setIsAddRubricsOpen, toggleUpdate }) {
    const [academicYear, setAcademicYear] = useState('');
    const [course, setCourse] = useState('');
    const [file, setFile] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef(null);
    const academicYearList = [];

    const d = new Date();

    for (let i = 2024; i <= d.getFullYear(); i++) {
        academicYearList.push(i)
    }

    const yearOptions = academicYearList.map(year => (
        {
            value: year,
            label: year
        }
    ));

    const courseOptions = [
        { value: 'BCA', label: 'BCA' },
        { value: 'MCA', label: 'MCA' }
    ];

    const handleDownloadFormat = async () => {
        try {
            const response = await axios.get('/download-format/rubrics',
                {
                    responseType: 'blob',
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'uploadRubricsFormat.xlsx';

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            setErrorMsg('Failed to download report.');
        }
    }

    const handleUploadRubrics = async () => {
        if (!academicYear || !course) {
            setErrorMsg("Please fill all the fields!");
            return;
        }

        if (!file) {
            setErrorMsg("Please choose a file!");
            return;
        }
        setErrorMsg('');
        const formData = new FormData();
        formData.append('academicYear', academicYear);
        formData.append('course', course);
        formData.append('rubricFile', file);

        try {
            const res = await axios.post('/rubrics/upload-rubric', formData);
            setSuccessMsg(res.data.message);
            toggleUpdate();
            console.log(res.data);
        } catch (error) {
            console.log('ERROR || AddMultipleRubrics || handleUploadRubrics(): ', error);
            setErrorMsg(error?.response?.data?.message || 'Failed to upload rubrics!')
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        const validTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        ];

        if (!selectedFile) return;
        if (!validTypes.includes(selectedFile.type)) {
            setErrorMsg('Only Excel files (.xls, .xlsx) are allowed');
            setFile(null);
            return;
        }

        setErrorMsg('');
        setFile(selectedFile);
    }

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
    }

    return (
        <div className="px-6 py-5 space-y-3">
            {/* Academic Year */}
            <div>
                <label
                    className="mb-1 block text-sm font-semibold"
                    style={{ color: COLORS.mintDark }}
                >
                    Academic Year
                </label>

                <Select
                    options={yearOptions}
                    placeholder="Select year"
                    value={yearOptions.find(option => option.value === academicYear)}
                    onChange={selected => setAcademicYear(selected?.value || "")}
                    maxMenuHeight={120}
                />
            </div>

            {/* Course */}
            <div>
                <label
                    className="mb-1 block text-sm font-semibold"
                    style={{ color: COLORS.mintDark }}
                >
                    Course
                </label>

                <Select
                    options={courseOptions}
                    placeholder="Select course"
                    value={courseOptions.find(option => option.value === course)}
                    onChange={selected => setCourse(selected?.value || "")}
                    maxMenuHeight={120}
                />
            </div>

            {/* File Picker */}
            <div>
                <label
                    className="mb-2 block text-sm font-semibold"
                    style={{ color: COLORS.mintDark }}
                >
                    Excel File
                </label>

                <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

                    <label
                        className="cursor-pointer whitespace-nowrap border-r border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-100"
                        style={{
                            backgroundColor: COLORS.latteDark,
                            color: COLORS.mintDark,
                        }}
                    >
                        Choose File

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xls,.xlsx"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    <div className="flex-1 truncate px-4 text-sm text-gray-600">
                        {file ? file.name : "No file selected"}
                    </div>

                    {file && (
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="px-3 text-red-500 transition hover:text-red-700 cursor-pointer"
                        >
                            <MdOutlineCancelPresentation className="h-6 w-6" />
                        </button>
                    )}

                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Supported formats: <strong>.xls</strong>, <strong>.xlsx</strong>
                </p>
            </div>

            {/* Error / Success */}
            <ErrorSuccessMsg
                errorMsg={errorMsg}
                successMsg={successMsg}
                setSuccessMsg={setSuccessMsg}
                setIsOpen={setIsAddRubricsOpen}
            />

            {/* Footer */}
            <div className="border-t border-gray-200 pt-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <button
                        onClick={handleDownloadFormat}
                        className="w-full md:w-auto rounded-xl border border-gray-300 bg-gray-100 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-200 cursor-pointer"
                    >
                        Download Format
                    </button>

                    <div className="flex flex-col-reverse sm:flex-row gap-3">

                        <button
                            onClick={() => setIsUploadOpen(false)}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleUploadRubrics}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font,
                            }}
                        >
                            Upload Rubrics
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default AddMultipleRubrics