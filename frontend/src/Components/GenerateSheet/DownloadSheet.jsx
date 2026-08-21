import React, { useState } from 'react'
import { COLORS } from '../../constants/theme';
import ErrorSuccessMsg from '../../utils/ErrorSuccessMsg';
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import Select from 'react-select'
import axios from 'axios';

function DownloadSheet({ setIsDownloadSheetOpen }) {
    // const [course, setCourse] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

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

    // const courseOptions = [
    //     { value: 'BCA', label: 'BCA' },
    //     { value: 'MCA', label: 'MCA' }
    // ];

    const handleDownload = async () => {
        if (!subjectId || !academicYear) {
            setErrorMsg("Please fill all the fields!");
            return;
        }
        setErrorMsg('');

        try {
            const response = await axios.get('/raw/download-marks',
                {
                    params: {
                        subjectId,
                        academicYear
                    },
                    responseType: 'blob',
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${subjectId}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download report.');
        }




        // if (course.length === 0 || academicYear.length === 0) {
        //     setErrorMsg("Please fill all the fields!");
        //     return;
        // }
        // setErrorMsg('');

        // try {
        //     const res = await axios.post('/dir/', {
        //         course,
        //         academicYear
        //     });
        //     setSuccessMsg('Attainment generated successfully!');
        //     console.log(res.data);
        //     toggleUpdate();
        // } catch (err) {
        //     setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download sheet!');;
        //     console.log('ERROR || GenerateAttainmentForm || handleDownload(): ', err);
        // }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setIsDownloadSheetOpen(false)}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl shadow-2xl sm:max-w-lg"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <div className="min-w-0">
                        <h2
                            className="text-lg font-semibold sm:text-xl"
                            style={{ color: COLORS.font }}
                        >
                            Download Sheet
                        </h2>

                        <p
                            className="mt-1 text-sm opacity-90"
                            style={{ color: COLORS.font }}
                        >
                            Download Sheet for a selected subject code.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsDownloadSheetOpen(false)}
                        className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose
                            className="h-6 w-6"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
                    style={{ backgroundColor: COLORS.latte }}
                >
                    {/* Academic Year */}
                    <div>
                        <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Academic Year
                        </label>

                        <Select
                            options={yearOptions}
                            placeholder="Select year"
                            value={yearOptions.find(
                                (option) => option.value === academicYear
                            )}
                            onChange={(selected) =>
                                setAcademicYear(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        />
                    </div>

                    {/* Course */}
                    {/* Subject ID */}
                    <div>
                        <label
                            className="mb-1 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Subject Code
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. CA1603"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 sm:px-4 py-2 text-sm outline-none focus:border-gray-400"
                            style={{ color: COLORS.mintDark }}
                        />
                        {/* <label
                            className="mb-2 block text-sm font-semibold"
                            style={{ color: COLORS.mintDark }}
                        >
                            Course
                        </label>

                        <Select
                            options={courseOptions}
                            placeholder="Select course"
                            value={courseOptions.find(
                                (option) => option.value === course
                            )}
                            onChange={(selected) =>
                                setCourse(selected?.value || "")
                            }
                            maxMenuHeight={180}
                        /> */}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t border-gray-300 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0 flex-1">
                            <ErrorSuccessMsg
                                errorMsg={errorMsg}
                                successMsg={successMsg}
                                setSuccessMsg={setSuccessMsg}
                                setIsOpen={setIsDownloadSheetOpen}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">

                            <button
                                onClick={() => setIsDownloadSheetOpen(false)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDownload}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="w-full rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 sm:w-auto cursor-pointer"
                                style={{
                                    backgroundColor: isHovered
                                        ? COLORS.mintDark
                                        : COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                Download
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DownloadSheet